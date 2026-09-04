import { LogRepository, LogFilter } from '../repositories/LogRepository';

export interface AdminLogParams extends LogFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AdminLogsService {
  private static MAX_BRIEF_LENGTH = parseInt(process.env.MAX_LOG_RESPONSE_BRIEF_LENGTH || '1000', 10);
  private static SENSITIVE_REGEX = /(bearer\s+[\w\-._~+/]+=*|sk_live_[a-zA-Z0-9_]+|password(?:["']?\s*:\s*["']?)\s*([^"'\s,}]+)|secret(?:["']?\s*:\s*["']?)\s*([^"'\s,}]+)|token(?:["']?\s*:\s*["']?)\s*([^"'\s,}]+))/gi;

  public static async getLogs(params: AdminLogParams) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, parseInt(process.env.ADMIN_LOGS_MAX_LIMIT || '100', 10));
    
    // Fetch all matching logs
    let logs = await LogRepository.getLogs(params);

    // Sorting
    const sortBy = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';

    logs.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'timestamp') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedLogs = logs.slice(startIndex, startIndex + limit);

    // Sanitize and format
    const formattedLogs = paginatedLogs.map(log => this.formatAndSanitizeLog(log));

    return {
      page,
      limit,
      total,
      totalPages,
      data: formattedLogs
    };
  }

  public static async getLogById(requestId: string) {
    const log = await LogRepository.getLogById(requestId);
    if (!log) return null;
    return this.formatAndSanitizeLog(log);
  }

  public static async getStats(params: LogFilter) {
    const logs = await LogRepository.getLogs(params);

    const stats = {
      totalRequests: logs.length,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      averageDurationMs: 0,
      requestsToday: 0,
      statusCodes: {} as Record<string, number>
    };

    if (logs.length === 0) {
      return stats;
    }

    let totalDuration = 0;
    const today = new Date().toISOString().split('T')[0];

    logs.forEach(log => {
      // Success vs Failed
      if (log.statusCode >= 200 && log.statusCode < 400) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }

      // Duration
      if (typeof log.durationMs === 'number') {
        totalDuration += log.durationMs;
      }

      // Status Codes
      const code = String(log.statusCode || 'unknown');
      stats.statusCodes[code] = (stats.statusCodes[code] || 0) + 1;

      // Requests today
      if (log.timestamp && log.timestamp.startsWith(today)) {
        stats.requestsToday++;
      }
    });

    stats.errorRate = parseFloat(((stats.failedRequests / stats.totalRequests) * 100).toFixed(2));
    stats.averageDurationMs = Math.round(totalDuration / stats.totalRequests);

    return stats;
  }

  private static formatAndSanitizeLog(logEntry: any) {
    // Standardize keys (camelCase)
    const formatted: any = {
      requestId: logEntry.request_id || logEntry.requestId,
      method: logEntry.method,
      path: logEntry.path,
      apiVersion: logEntry.apiVersion,
      statusCode: logEntry.statusCode,
      durationMs: logEntry.durationMs,
      ip: logEntry.ip,
      userAgent: logEntry.userAgent,
      tenantId: logEntry.tenantId,
      appId: logEntry.appId,
      errorCode: logEntry.errorCode,
      errorMessage: logEntry.errorMessage,
      timestamp: logEntry.timestamp,
      geo: logEntry.geo
    };

    // Sanitize Response Brief
    if (logEntry.responseBrief) {
      let brief = typeof logEntry.responseBrief === 'string' ? logEntry.responseBrief : JSON.stringify(logEntry.responseBrief);
      
      // Truncate
      if (brief.length > this.MAX_BRIEF_LENGTH) {
        brief = brief.substring(0, this.MAX_BRIEF_LENGTH) + '...[TRUNCATED]';
      }

      // Redact sensitive patterns
      brief = brief.replace(this.SENSITIVE_REGEX, '[REDACTED]');
      
      formatted.responseBrief = brief;
    }

    // Explicitly ensure sensitive fields are not mapped if they ever exist at root
    delete formatted.authorization;
    delete formatted.password;
    delete formatted.accessToken;
    delete formatted.refreshToken;
    delete formatted.cookie;
    delete formatted.secret;

    return formatted;
  }
}
