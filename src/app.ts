import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import crypto from 'crypto';

// Initialize logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization', 'Authorization', 'secret'],
    censor: '[REDACTED]'
  },
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
});

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Request ID middleware
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
});

// Rate limiting (tenant based if auth exists, else IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT || '100', 10),
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    return (req.headers['authorization'] || ip).toString();
  },
  validate: { ip: false }, // Disable IP validation check from express-rate-limit
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Parse JSON bodies with strict size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Request logging
app.use(pinoHttp({ 
  logger,
  genReqId: function (req) { return (req.headers['x-request-id'] as string) || `req-${Date.now()}` }
}));

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/ready', (req, res) => {
  // Add Redis/Mongo checks here later
  res.json({ status: 'ok' });
});

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

// Swagger UI
app.use('/sandbox', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Shopiators API Docs'
}));

import productRoutes from './routes/v1/products';
import variantRoutes from './routes/v1/variants';
import authRoutes from './routes/v1/auth';
import collectionRoutes from './routes/v1/collections';
import attributeRoutes from './routes/v1/attributes';

// Base API route placeholder
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/products/:productId/variants', variantRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/attributes', attributeRoutes);

app.get('/api/v1', (req, res) => {
  res.json({ message: 'Shopiators Public API v1' });
});

import { ZodError } from 'zod';

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: (err as any).errors
      }
    });
    return;
  }

  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal Server Error'
    }
  });
});

export default app;
