import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import geoip from 'geoip-lite';

import { appendLog } from '../utils/logManager';

// Extend Express Request and Response to include our custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  // 1. Generate unique request ID
  const requestId = `req_${crypto.randomUUID().replace(/-/g, '')}`;
  req.id = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);

  const startTime = performance.now();
  let responseBrief: string | undefined;

  // 2. Intercept res.json to inject debug_id and capture brief
  const originalJson = res.json;
  res.json = function (body: any) {
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      body.debug_id = requestId;
    }
    
    try {
      const stringified = JSON.stringify(body);
      responseBrief = stringified.length > 500 ? stringified.substring(0, 500) + '...' : stringified;
    } catch (e) {
      responseBrief = '[Unserializable]';
    }

    return originalJson.call(this, body);
  };

  // 3. Intercept res.send to capture brief for non-JSON responses
  const originalSend = res.send;
  res.send = function (body: any) {
    if (!responseBrief) {
      try {
        const stringified = typeof body === 'string' ? body : JSON.stringify(body);
        responseBrief = stringified.length > 500 ? stringified.substring(0, 500) + '...' : stringified;
      } catch (e) {
        responseBrief = '[Unserializable]';
      }
    }
    return originalSend.call(this, body);
  };

  // 4. Hook into response finish event for async persistence
  res.on('finish', () => {
    try {
      // Calculate duration
      const durationMs = performance.now() - startTime;

      // Extract client IP with x-forwarded-for fallback
      const xForwardedFor = req.headers['x-forwarded-for'];
      const rawIp = Array.isArray(xForwardedFor) ? xForwardedFor[0] : (xForwardedFor || req.ip || req.socket.remoteAddress || '');
      const ip = rawIp.split(',')[0].trim(); // Get the first IP if it's a comma-separated list

      // GeoIP Lookup
      let geoData = undefined;
      if (ip) {
        const geo = geoip.lookup(ip);
        if (geo) {
          geoData = {
            country: geo.country,
            region: geo.region,
            city: geo.city,
            timezone: geo.timezone
          };
        }
      }

      // Extract API Version from path
      const pathUrl = req.originalUrl || req.path;
      const apiVersionMatch = pathUrl.match(/\/(v\d+)\//);
      const apiVersion = apiVersionMatch ? apiVersionMatch[1] : 'unknown';

      // Extract tenant/app info if populated by other middleware (e.g., auth)
      const tenantId = (req as any).tenant?.storeSlug || null;
      const appId = (req as any).appId || null; // If partner auth is used

      // Extract error details if any (assuming global error handler sets res.locals.errorData)
      const errorData = res.locals.errorData || null;

      // Construct log payload
      const logEntry = {
        request_id: requestId,
        method: req.method,
        path: pathUrl,
        apiVersion,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
        ip,
        userAgent: req.get('user-agent') || '',
        tenantId,
        appId,
        errorCode: errorData?.code || null,
        errorMessage: errorData?.message || null,
        responseBrief,
        geo: geoData,
        timestamp: new Date().toISOString()
      };

      // Persist asynchronously (catch any errors to prevent unhandled rejections)
      Promise.resolve(appendLog(logEntry)).catch(err => {
        console.error('Error persisting API log:', err);
      });
    } catch (err) {
      console.error('Error in API logger finish handler:', err);
    }
  });

  next();
};
