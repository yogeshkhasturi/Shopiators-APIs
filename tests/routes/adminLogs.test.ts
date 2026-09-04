import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import { LogRepository } from '../../src/repositories/LogRepository';

jest.mock('../../src/repositories/LogRepository');

describe('Admin Logs API', () => {
  const secret = process.env.PUBLIC_API_JWT_SECRET || 'test-secret';
  
  // Valid superadmin token with admin:logs:read scope
  const adminToken = jwt.sign({
    type: 'public_api_access',
    sub: 'admin1',
    storeSlug: 'admin-store',
    scopes: ['admin:logs:read']
  }, secret);

  // Invalid token (merchant without scope)
  const merchantToken = jwt.sign({
    type: 'public_api_access',
    sub: 'merchant',
    storeSlug: 'merchant-store',
    scopes: ['read_products']
  }, secret);

  beforeAll(() => {
    process.env.PUBLIC_API_JWT_SECRET = secret;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockLogs = [
    {
      request_id: 'req_1',
      method: 'GET',
      path: '/api/v1/test',
      apiVersion: 'v1',
      statusCode: 200,
      durationMs: 50,
      timestamp: new Date().toISOString(),
      responseBrief: '{"message":"Success","password":"secretpassword"}'
    },
    {
      request_id: 'req_2',
      method: 'POST',
      path: '/api/v1/orders',
      apiVersion: 'v1',
      statusCode: 400,
      durationMs: 150,
      timestamp: new Date(Date.now() - 10000).toISOString(),
      responseBrief: '{"error":"Bad Request"}'
    }
  ];

  describe('GET /api/v1/admin/logs', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/logs');
      expect(res.status).toBe(401);
    });

    it('should return 403 if missing scope', async () => {
      const res = await request(app)
        .get('/api/v1/admin/logs')
        .set('Authorization', `Bearer ${merchantToken}`);
      
      expect(res.status).toBe(403);
    });

    it('should return paginated logs and sanitize sensitive data', async () => {
      (LogRepository.getLogs as jest.Mock).mockResolvedValue(mockLogs);

      const res = await request(app)
        .get('/api/v1/admin/logs?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(2);
      expect(res.body.data.length).toBe(2);

      // Verify sanitization
      expect(res.body.data[0].responseBrief).not.toContain('secretpassword');
      expect(res.body.data[0].responseBrief).toContain('[REDACTED]');
    });
  });

  describe('GET /api/v1/admin/logs/stats', () => {
    it('should return log statistics', async () => {
      (LogRepository.getLogs as jest.Mock).mockResolvedValue(mockLogs);

      const res = await request(app)
        .get('/api/v1/admin/logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRequests).toBe(2);
      expect(res.body.data.successfulRequests).toBe(1);
      expect(res.body.data.failedRequests).toBe(1);
      expect(res.body.data.errorRate).toBe(50);
      expect(res.body.data.averageDurationMs).toBe(100);
      expect(res.body.data.statusCodes['200']).toBe(1);
      expect(res.body.data.statusCodes['400']).toBe(1);
    });
  });

  describe('GET /api/v1/admin/logs/:requestId', () => {
    it('should return a specific log', async () => {
      (LogRepository.getLogById as jest.Mock).mockResolvedValue(mockLogs[0]);

      const res = await request(app)
        .get('/api/v1/admin/logs/req_1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requestId).toBe('req_1');
    });

    it('should return 404 if not found', async () => {
      (LogRepository.getLogById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/admin/logs/req_invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
