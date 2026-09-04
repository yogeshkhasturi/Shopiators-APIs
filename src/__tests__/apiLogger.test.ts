import request from 'supertest';
import app from '../app';
import fs from 'fs-extra';
import path from 'path';
import { cleanupOldLogs } from '../utils/logManager';

describe('API Logger Middleware', () => {
  const LOGS_DIR = path.join(process.cwd(), 'logs');

  // Simple test endpoint to trigger an error for logging
  beforeAll(() => {
    app.get('/api/v1/test-error', (req, res, next) => {
      const error: any = new Error('Test internal error');
      error.code = 'TEST_ERROR';
      error.status = 500;
      next(error);
    });
  });

  it('should return X-Request-ID and debug_id in successful JSON response', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    
    // Check Header
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(/^req_[a-f0-9]{32}$/);
    
    // Check JSON body
    expect(res.body.debug_id).toBeDefined();
    expect(res.body.debug_id).toBe(res.headers['x-request-id']);
  });

  it('should return X-Request-ID and debug_id in error JSON response', async () => {
    const res = await request(app).get('/api/v1/test-error');
    expect(res.status).toBe(500);
    
    // Check Header
    expect(res.headers['x-request-id']).toBeDefined();
    
    // Check JSON body
    expect(res.body.debug_id).toBeDefined();
    expect(res.body.debug_id).toBe(res.headers['x-request-id']);
    
    // Ensure safe error
    expect(res.body.error.code).toBe('TEST_ERROR');
    expect(res.body.error.message).toBe('Test internal error');
  });

  it('should capture request duration and log safely without sensitive headers', async () => {
    const res = await request(app)
      .get('/api/v1')
      .set('Authorization', 'Bearer sensitive-token')
      .set('X-Forwarded-For', '192.168.1.1'); // mock IP
    
    expect(res.status).toBe(200);
    const reqId = res.body.debug_id;

    // We must wait slightly because logging is async on 'finish' event
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Read the current log file
    const date = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(LOGS_DIR, `api-logs-${date}.jsonl`);
    const fileContent = await fs.readFile(logFilePath, 'utf-8');
    
    // Find the log line for our request ID
    const logLines = fileContent.trim().split('\n').map((line) => JSON.parse(line));
    const logEntry = logLines.find((log) => log.request_id === reqId);
    
    expect(logEntry).toBeDefined();
    expect(logEntry.method).toBe('GET');
    expect(logEntry.path).toBe('/api/v1');
    expect(logEntry.statusCode).toBe(200);
    expect(logEntry.durationMs).toBeGreaterThanOrEqual(0);
    expect(logEntry.timestamp).toBeDefined();
    
    // Check sensitive data exclusion
    expect(logEntry.headers).toBeUndefined(); // We don't log raw headers entirely
    expect(JSON.stringify(logEntry)).not.toContain('sensitive-token');
  });

  it('should properly clean up logs older than 30 days', async () => {
    const oldDate = Date.now() - (35 * 24 * 60 * 60 * 1000); // 35 days ago
    const oldFileName = 'api-logs-old.jsonl';
    const oldFilePath = path.join(LOGS_DIR, oldFileName);
    
    // Create an artificial old file
    await fs.writeFile(oldFilePath, '{"test":true}\n');
    
    // Modify file stats to make it explicitly old
    await fs.utimes(oldFilePath, new Date(oldDate), new Date(oldDate));

    // Run cleanup
    await cleanupOldLogs();

    // Verify it was deleted
    const exists = await fs.pathExists(oldFilePath);
    expect(exists).toBe(false);
  });
});
