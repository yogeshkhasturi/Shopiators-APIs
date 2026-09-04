import fs from 'fs-extra';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
fs.ensureDirSync(LOGS_DIR);

/**
 * Gets the current log file path for today's date (YYYY-MM-DD)
 */
function getCurrentLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOGS_DIR, `api-logs-${date}.jsonl`);
}

/**
 * Appends a log entry to today's log file
 */
export async function appendLog(logEntry: any): Promise<void> {
  try {
    const filePath = getCurrentLogFilePath();
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Append asynchronously
    await fs.appendFile(filePath, logLine, 'utf8');
  } catch (error) {
    console.error('Failed to append API log to file:', error);
  }
}

/**
 * Cleans up log files older than the configured retention period
 * Default is 30 days.
 */
export async function cleanupOldLogs(): Promise<void> {
  try {
    const retentionDays = parseInt(process.env.API_LOG_RETENTION_DAYS || '30', 10);
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    const files = await fs.readdir(LOGS_DIR);
    
    for (const file of files) {
      if (file.startsWith('api-logs-') && file.endsWith('.jsonl')) {
        const filePath = path.join(LOGS_DIR, file);
        const stats = await fs.stat(filePath);
        
        // If file was modified/created before the retention period
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.remove(filePath);
          console.log(`[LogManager] Deleted old API log file: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('[LogManager] Failed to clean up old logs:', error);
  }
}
