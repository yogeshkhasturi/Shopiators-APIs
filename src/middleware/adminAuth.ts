// middleware/adminLogsAuth.ts

import { Request, Response, NextFunction } from 'express';

export const authenticateAdminLogs = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const configuredToken = process.env.ADMIN_LOGS_TOKEN;

    if (!configuredToken) {
        console.error('ADMIN_LOGS_TOKEN is not configured');

        return res.status(500).json({
            success: false,
            error: 'Admin logs authentication is not configured',
        });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
        });
    }

    const token = authHeader.substring(7).trim();

    if (!token || token !== configuredToken) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
        });
    }

    next();
};