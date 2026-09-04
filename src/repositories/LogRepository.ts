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

      for await (const line of rl) {
        if (!line.trim()) continue;

        try {
          const logEntry = JSON.parse(line);

          // Apply filters
          if (filter.startDate && new Date(logEntry.timestamp) < new Date(filter.startDate)) continue;
          if (filter.endDate && new Date(logEntry.timestamp) > new Date(filter.endDate)) continue;
          if (filter.requestId && logEntry.request_id !== filter.requestId) continue;
          if (filter.method && logEntry.method !== filter.method) continue;
          if (filter.path && logEntry.path !== filter.path) continue;
          if (filter.statusCode && logEntry.statusCode !== filter.statusCode) continue;
          if (filter.tenantId && logEntry.tenantId !== filter.tenantId) continue;
          if (filter.appId && logEntry.appId !== filter.appId) continue;
          if (filter.errorCode && logEntry.errorCode !== filter.errorCode) continue;
          if (filter.minDuration && logEntry.durationMs < filter.minDuration) continue;
          if (filter.maxDuration && logEntry.durationMs > filter.maxDuration) continue;

          // Search
          if (searchStr) {
            const matchesSearch = 
              (logEntry.request_id && logEntry.request_id.toLowerCase().includes(searchStr)) ||
              (logEntry.path && logEntry.path.toLowerCase().includes(searchStr)) ||
              (logEntry.tenantId && logEntry.tenantId.toLowerCase().includes(searchStr)) ||
              (logEntry.appId && logEntry.appId.toLowerCase().includes(searchStr)) ||
              (logEntry.errorCode && logEntry.errorCode.toLowerCase().includes(searchStr)) ||
              (logEntry.errorMessage && logEntry.errorMessage.toLowerCase().includes(searchStr));
            
            if (!matchesSearch) continue;
          }

          logs.push(logEntry);
        } catch (error) {
          // Ignore malformed lines
        }
      }
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

      for await (const line of rl) {
        if (!line.trim()) continue;

        try {
          const logEntry = JSON.parse(line);
          if (logEntry.request_id === requestId) {
            rl.close();
            return logEntry;
          }
        } catch (error) {
          // Ignore malformed lines
        }
      }
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
