import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory store for idempotency (in production, use Redis)
const idempotencyStore = new Map<string, {
  hash: string;
  responseStatus: number;
  responseBody: any;
  timestamp: number;
}>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return next();
  }
  
  // Hash the body to detect payload changes
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');
  const storedRecord = idempotencyStore.get(idempotencyKey);
  
  if (storedRecord) {
    if (storedRecord.hash !== payloadHash) {
       res.status(409).json({
        success: false,
        error: {
          code: 'IDEMPOTENCY_CONFLICT',
          message: 'Idempotency key reused with a different payload'
        }
      });
      return;
    }
    // Return cached response
    res.status(storedRecord.responseStatus).json(storedRecord.responseBody);
    return;
  }
  
  // Hook into response to cache it
  const originalJson = res.json;
  res.json = function (body: any) {
    idempotencyStore.set(idempotencyKey, {
      hash: payloadHash,
      responseStatus: res.statusCode,
      responseBody: body,
      timestamp: Date.now()
    });
    return originalJson.call(this, body);
  };
  
  next();
};

// Cleanup routine (optional, for memory management)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
