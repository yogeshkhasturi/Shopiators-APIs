import express from 'express';
import { apiLogger } from './middleware/apiLogger';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import crypto from 'crypto';
import path from 'path';

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

app.set('trust proxy', 1);

import { cleanupOldLogs } from './utils/logManager';
// Run cleanup asynchronously on startup
cleanupOldLogs();

// Serve static assets
app.use(express.static(path.join(process.cwd(), 'public')));

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

// API Logger and Request ID middleware
app.use(apiLogger);

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
import { generateLlmsFullText } from './docs/llmsGenerator';

// Expose Canonical OpenAPI Specification
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// Expose dynamic LLM markdown
app.get('/llms-full.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(generateLlmsFullText(swaggerSpec));
});

// Middleware to inject SEO meta and noscript into Swagger UI
const swaggerHtmlModifier = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string' && body.includes('<title>')) {
      body = body.replace(
        '</head>',
        '  <meta name="description" content="Shopiators Public API Sandbox. Shopiators provides a public API that migration platforms can use to integrate with Shopiators stores.">\n</head>'
      );
      body = body.replace(
        '<body>',
        '<body>\n<noscript>\n<h1>Shopiators Public API</h1>\n<p>Shopiators provides a public API that migration platforms can use to integrate with Shopiators stores.</p>\n<p>Use the Shopiators API Sandbox to explore and test available endpoints.</p>\n</noscript>'
      );
    }
    return originalSend.call(this, body);
  };
  next();
};

// Swagger UI
app.use('/sandbox', swaggerHtmlModifier, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
  .swagger-ui .topbar {
  background-color: #fff;
  }
    .dark-mode .swagger-ui .topbar { background-color: #000000ff; padding: 10px 0; }
    .swagger-ui .topbar .link svg { display: none; }
    .swagger-ui .topbar .link img { display: none; }
     .swagger-ui .topbar .link {
      background: url('/shopiators-logo.png') no-repeat left center;
      background-size: contain;
      width: 200px;
      height: 40px;
      display: inline-block;
}
    .dark-mode .swagger-ui .topbar .link {
      background: url('/shopiators-logo-white.png') no-repeat left center;
      background-size: contain;
      width: 200px;
      height: 40px;
      display: inline-block;
    }
      .swagger-ui .topbar .topbar-wrapper {
    justify-content: space-between;
}
   .swagger-ui .topbar .dark-mode-toggle svg{
    fill: #000!important;
    }
   .dark-mode .swagger-ui .topbar .dark-mode-toggle svg{
    fill: #e0c216ff!important;
    }
  `,
  customfavIcon: '/favicon.ico',
  customSiteTitle: 'Shopiators Public API Sandbox'
}));

import productRoutes from './routes/v1/products';
import variantRoutes from './routes/v1/variants';
import authRoutes from './routes/v1/auth';
import collectionRoutes from './routes/v1/collections';
import attributeRoutes from './routes/v1/attributes';
import attributeSetRoutes from './routes/v1/attributeSets';
import orderRoutes from './routes/v1/orders';
import customerRoutes from './routes/v1/customers';
import addressRoutes from './routes/v1/addresses';
import adminLogsRoutes from './routes/v1/adminLogs';

// Base API route placeholder
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/products/:productId/variants', variantRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/attributes', attributeRoutes);
app.use('/api/v1/attribute-sets', attributeSetRoutes);
app.use('/api/v1/admin/logs', adminLogsRoutes);

app.get('/api/v1', (req, res) => {
  res.json({ message: 'Shopiators Public API v1' });
});

import { ZodError } from 'zod';
import { welcomeHtml } from './utils/welcomeHtml';

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.name === 'ZodError') {
    const zodErrors = err.issues || err.errors || [];
    const errorMessage = zodErrors.length > 0 ? zodErrors[0].message : 'Invalid request data';
    const errorData = {
      code: 'VALIDATION_ERROR',
      message: errorMessage,
      details: zodErrors
    };
    res.locals.errorData = errorData;
    res.status(400).json({
      success: false,
      error: errorData
    });
    return;
  }

  logger.error(err);
  const errorData = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal Server Error'
  };
  res.locals.errorData = errorData;
  res.status(err.status || 500).json({
    success: false,
    error: errorData
  });
});

app.get('/', (req, res) => {
  res.send(welcomeHtml);
});

export default app;
