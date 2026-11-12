import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// Mock Mongo models before importing app/services
const mockApiCredentialFindOne = jest.fn();
const mockApiCredentialUpdateOne = jest.fn().mockResolvedValue({});
jest.mock('../../models/ApiCredential.js', () => ({
  __esModule: true,
  default: {
    findOne: mockApiCredentialFindOne,
    updateOne: mockApiCredentialUpdateOne,
    create: jest.fn(),
  },
}));

const mockRefreshTokenFindOne = jest.fn();
const mockRefreshTokenCreate = jest.fn().mockResolvedValue({});
const mockRefreshTokenUpdateMany = jest.fn().mockResolvedValue({});
jest.mock('../../models/RefreshToken', () => ({
  findOne: mockRefreshTokenFindOne,
  create: mockRefreshTokenCreate,
  updateMany: mockRefreshTokenUpdateMany,
}));

import app from '../app';
import { validateSftpConfig } from '../services/ftpUploader';
import { ApiKeyService } from '../services/ApiKeyService';
import { AdminLogsService } from '../services/AdminLogsService';

describe('TSK-01: SFTP Config Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws listing missing variable names without exposing values', () => {
    delete process.env.SFTP_HOST;
    delete process.env.SFTP_PORT;
    delete process.env.SFTP_USER;
    delete process.env.SFTP_PASSWORD;

    expect(() => validateSftpConfig()).toThrow(
      'Missing required SFTP environment variables: SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASSWORD'
    );
  });

  it('rejects invalid SFTP_PORT', () => {
    process.env.SFTP_HOST = 'sftp.example.com';
    process.env.SFTP_PORT = 'not-a-port';
    process.env.SFTP_USER = 'user';
    process.env.SFTP_PASSWORD = 'secret-value';

    expect(() => validateSftpConfig()).toThrow('Invalid SFTP_PORT');
  });

  it('returns parsed config when all SFTP env vars are valid', () => {
    process.env.SFTP_HOST = 'sftp.example.com';
    process.env.SFTP_PORT = '22';
    process.env.SFTP_USER = 'user';
    process.env.SFTP_PASSWORD = 'secret-value';

    const cfg = validateSftpConfig();
    expect(cfg.host).toBe('sftp.example.com');
    expect(cfg.port).toBe(22);
    expect(cfg.user).toBe('user');
  });
});

describe('TSK-02: /api/v1/admin/logs Authentication & Tenant Isolation', () => {
  const originalToken = process.env.ADMIN_LOGS_TOKEN;
  const originalJwt = process.env.PUBLIC_API_JWT_SECRET;

  beforeEach(() => {
    process.env.ADMIN_LOGS_TOKEN = 'test-admin-logs-secret';
    process.env.PUBLIC_API_JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env.ADMIN_LOGS_TOKEN = originalToken;
    process.env.PUBLIC_API_JWT_SECRET = originalJwt;
  });

  it('denies unauthenticated requests to /, /stats, and /:requestId', async () => {
    const [r1, r2, r3] = await Promise.all([
      request(app).get('/api/v1/admin/logs'),
      request(app).get('/api/v1/admin/logs/stats'),
      request(app).get('/api/v1/admin/logs/req_123'),
    ]);

    expect(r1.status).toBe(401);
    expect(r2.status).toBe(401);
    expect(r3.status).toBe(401);
  });

  it('denies JWT without admin:logs:read scope (403)', async () => {
    const token = jwt.sign(
      { sub: 'u1', storeSlug: 'tenant-a', type: 'public_api_access', scopes: ['products:read'] },
      process.env.PUBLIC_API_JWT_SECRET!
    );

    const res = await request(app)
      .get('/api/v1/admin/logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('allows valid ADMIN_LOGS_TOKEN', async () => {
    jest.spyOn(AdminLogsService, 'getLogs').mockResolvedValue({
      logs: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
    } as any);

    const res = await request(app)
      .get('/api/v1/admin/logs')
      .set('Authorization', 'Bearer test-admin-logs-secret');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('scopes tenant JWT with admin:logs:read to its own storeSlug and blocks Tenant B log lookup', async () => {
    const spy = jest.spyOn(AdminLogsService, 'getLogs').mockResolvedValue({
      logs: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
    } as any);
    jest.spyOn(AdminLogsService, 'getLogById').mockResolvedValue({
      request_id: 'req_b',
      tenantId: 'tenant-b',
    } as any);

    const tenantAToken = jwt.sign(
      { sub: 'u1', storeSlug: 'tenant-a', type: 'public_api_access', scopes: ['admin:logs:read'] },
      process.env.PUBLIC_API_JWT_SECRET!
    );

    const listRes = await request(app)
      .get('/api/v1/admin/logs?tenantId=tenant-b')
      .set('Authorization', `Bearer ${tenantAToken}`);
    expect(listRes.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-a' }));

    const detailRes = await request(app)
      .get('/api/v1/admin/logs/req_b')
      .set('Authorization', `Bearer ${tenantAToken}`);
    expect(detailRes.status).toBe(404);
  });
});

describe('TSK-04: ApiKeyService Validation (bcrypt + legacy SHA-256 + edge cases)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates sk_live_ and sk_test_ bcrypt keys', async () => {
    const secret = 'mysecret123';
    const secretHash = await bcrypt.hash(secret, 4);
    mockApiCredentialFindOne.mockResolvedValue({
      _id: 'cred1',
      keyId: 'key123',
      secretHash,
      storeSlug: 'store-a',
      scopes: ['products:read'],
      status: 'active',
    });

    const liveCred = await ApiKeyService.validateKey(`sk_live_key123_${secret}`);
    expect(liveCred?.storeSlug).toBe('store-a');

    const testCred = await ApiKeyService.validateKey(`sk_test_key123_${secret}`);
    expect(testCred?.storeSlug).toBe('store-a');
  });

  it('validates legacy SHA-256 keys during grace period', async () => {
    const secret = 'legacysecret';
    const sha256 = crypto.createHash('sha256').update(secret).digest('hex');
    mockApiCredentialFindOne.mockResolvedValue({
      _id: 'cred2',
      keyId: 'legacykey',
      secretHash: sha256,
      storeSlug: 'store-legacy',
      scopes: ['store:read'],
      status: 'active',
    });

    const cred = await ApiKeyService.validateKey(`sk_live_legacykey_${secret}`);
    expect(cred?.storeSlug).toBe('store-legacy');
  });

  it('rejects malformed prefix, wrong secret, unknown keyId, revoked, and expired keys', async () => {
    expect(await ApiKeyService.validateKey('pk_live_key_sec')).toBeNull();
    expect(await ApiKeyService.validateKey('sk_prod_key_sec')).toBeNull();
    expect(await ApiKeyService.validateKey('sk_live_onlytwo')).toBeNull();

    // Unknown / revoked (findOne with status: 'active' returns null)
    mockApiCredentialFindOne.mockResolvedValueOnce(null);
    expect(await ApiKeyService.validateKey('sk_live_unknown_sec')).toBeNull();

    // Expired key
    const hash = await bcrypt.hash('sec', 4);
    mockApiCredentialFindOne.mockResolvedValueOnce({
      _id: 'cred3',
      keyId: 'expkey',
      secretHash: hash,
      storeSlug: 'store-a',
      status: 'active',
      expiresAt: new Date(Date.now() - 10000),
    });
    expect(await ApiKeyService.validateKey('sk_live_expkey_sec')).toBeNull();

    // Invalid secret
    mockApiCredentialFindOne.mockResolvedValueOnce({
      _id: 'cred4',
      keyId: 'goodkey',
      secretHash: hash,
      storeSlug: 'store-a',
      status: 'active',
    });
    expect(await ApiKeyService.validateKey('sk_live_goodkey_wrongsec')).toBeNull();
  });
});

describe('TSK-13: POST /api/v1/auth/refresh', () => {
  beforeEach(() => {
    process.env.PUBLIC_API_JWT_SECRET = 'test-jwt-secret';
    jest.clearAllMocks();
  });

  it('rotates valid refresh token and issues new access + refresh tokens', async () => {
    const secret = 'validrefreshsecret';
    const tokenHash = crypto.createHash('sha256').update(secret).digest('hex');
    const saveMock = jest.fn().mockResolvedValue({});

    mockRefreshTokenFindOne.mockResolvedValue({
      tokenId: 'tid1',
      tokenHash,
      familyId: 'fam1',
      userId: 'user1',
      storeSlug: 'store-a',
      scopes: ['products:read'],
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: null,
      save: saveMock,
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: `rt_tid1_${secret}` });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toMatch(/^rt_/);
    expect(saveMock).toHaveBeenCalled();
    expect(mockRefreshTokenCreate).toHaveBeenCalled();
  });

  it('revokes entire token family on refresh token reuse', async () => {
    const secret = 'reusedsecret';
    const tokenHash = crypto.createHash('sha256').update(secret).digest('hex');

    mockRefreshTokenFindOne.mockResolvedValue({
      tokenId: 'tid2',
      tokenHash,
      familyId: 'fam2',
      userId: 'user1',
      storeSlug: 'store-a',
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: `rt_tid2_${secret}` });

    expect(res.status).toBe(401);
    expect(mockRefreshTokenUpdateMany).toHaveBeenCalledWith(
      { familyId: 'fam2', revokedAt: null },
      expect.any(Object)
    );
  });

  it('rejects malformed refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'bad_token' });

    expect(res.status).toBe(401);
  });
});

