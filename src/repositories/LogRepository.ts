import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

const LOGS_DIR = path.join(process.cwd(), 'logs');

export interface LogFilter {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  tenantId?: string;
  appId?: string;
  errorCode?: string;
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
}

export class LogRepository {
  /**
   * Reads and filters logs across all matching files in the logs directory.
   */
  public static async getLogs(filter: LogFilter): Promise<any[]> {
    const files = await this.getLogFiles(filter.startDate, filter.endDate);
    const logs: any[] = [];

    // Search query normalized
    const searchStr = filter.search ? filter.search.toLowerCase() : null;

    for (const file of files) {
      const filePath = path.join(LOGS_DIR, file);
      
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream as any,
        crlfDelay: Infinity,
      });

      await new Promise<void>((resolve) => {
        rl.on('line', (line) => {
          if (!line.trim()) return;

          try {
            const logEntry = JSON.parse(line);

            // Apply filters
            if (filter.startDate && new Date(logEntry.timestamp) < new Date(filter.startDate)) return;
            if (filter.endDate && new Date(logEntry.timestamp) > new Date(filter.endDate)) return;
            if (filter.requestId && logEntry.request_id !== filter.requestId) return;
            if (filter.method && logEntry.method !== filter.method) return;
            if (filter.path && logEntry.path !== filter.path) return;
            if (filter.statusCode && logEntry.statusCode !== filter.statusCode) return;
            if (filter.tenantId && logEntry.tenantId !== filter.tenantId) return;
            if (filter.appId && logEntry.appId !== filter.appId) return;
            if (filter.errorCode && logEntry.errorCode !== filter.errorCode) return;
            if (filter.minDuration && logEntry.durationMs < filter.minDuration) return;
            if (filter.maxDuration && logEntry.durationMs > filter.maxDuration) return;

            // Search
            if (searchStr) {
              const matchesSearch = 
                (logEntry.request_id && logEntry.request_id.toLowerCase().includes(searchStr)) ||
                (logEntry.path && logEntry.path.toLowerCase().includes(searchStr)) ||
                (logEntry.tenantId && logEntry.tenantId.toLowerCase().includes(searchStr)) ||
                (logEntry.appId && logEntry.appId.toLowerCase().includes(searchStr)) ||
                (logEntry.errorCode && logEntry.errorCode.toLowerCase().includes(searchStr)) ||
                (logEntry.errorMessage && logEntry.errorMessage.toLowerCase().includes(searchStr));
              
              if (!matchesSearch) return;
            }

            logs.push(logEntry);
          } catch (error) {
            // Ignore malformed lines
          }
        });

        rl.on('close', () => {
          resolve();
        });
      });
    }

    return logs;
  }

  /**
   * Retrieves a single log entry by its requestId.
   */
  public static async getLogById(requestId: string): Promise<any | null> {
    const files = await this.getLogFiles();

    for (const file of files) {
      const filePath = path.join(LOGS_DIR, file);
      
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream as any,
        crlfDelay: Infinity,
      });

      const foundLog = await new Promise<any | null>((resolve) => {
        let found: any = null;
        rl.on('line', (line) => {
          if (!line.trim() || found) return;

          try {
            const logEntry = JSON.parse(line);
            if (logEntry.request_id === requestId) {
              found = logEntry;
              rl.close();
            }
          } catch (error) {
            // Ignore malformed lines
          }
        });

        rl.on('close', () => {
          resolve(found);
        });
      });

      if (foundLog) return foundLog;
    }

    return null;
  }

  /**
   * Helper to get log files, optionally bounded by date.
   */
  private static async getLogFiles(startDateStr?: string, endDateStr?: string): Promise<string[]> {
    try {
      if (!fs.existsSync(LOGS_DIR)) return [];
      
      const files = await fs.readdir(LOGS_DIR);
      let logFiles = files.filter(f => f.startsWith('api-logs-') && f.endsWith('.jsonl'));

      logFiles.sort((a, b) => b.localeCompare(a)); // Newest first

      if (startDateStr || endDateStr) {
        const start = startDateStr ? startDateStr.split('T')[0] : null; // e.g. "2026-09-04"
        const end = endDateStr ? endDateStr.split('T')[0] : null;

        logFiles = logFiles.filter(file => {
          const dateStr = file.replace('api-logs-', '').replace('.jsonl', '');
          if (start && dateStr < start) return false;
          if (end && dateStr > end) return false;
          return true;
        });
      }

      return logFiles;
    } catch (error) {
      console.error('[LogRepository] Error reading logs directory:', error);
      return [];
    }
  }
}
