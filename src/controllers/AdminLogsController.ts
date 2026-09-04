import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AdminLogsService } from '../services/AdminLogsService';

const getLogsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
  method: z.string().toUpperCase().refine(val => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(val), {
    message: "Invalid HTTP method"
  }).optional(),
  path: z.string().optional(),
  statusCode: z.string().regex(/^\d{3}$/).transform(Number).optional(),
  tenantId: z.string().optional(),
  appId: z.string().optional(),
  errorCode: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
  maxDuration: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['timestamp', 'durationMs', 'statusCode', 'method', 'path']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be less than or equal to endDate",
  path: ["startDate"]
});

const getStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tenantId: z.string().optional(),
  appId: z.string().optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be less than or equal to endDate",
  path: ["startDate"]
});

export const getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params = getLogsSchema.parse(req.query);
    const result = await AdminLogsService.getLogs(params);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params = getStatsSchema.parse(req.query);
    const stats = await AdminLogsService.getStats(params);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestId = req.params.requestId as string;
    
    // basic validation to prevent arbitrary large strings
    if (!requestId || typeof requestId !== 'string' || requestId.length > 100) {
      res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST_ID', message: 'Invalid Request ID format' }});
      return;
    }

    const log = await AdminLogsService.getLogById(requestId);

    if (!log) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Log not found' } });
      return;
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};
