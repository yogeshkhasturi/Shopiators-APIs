// middleware/adminLogsAuth.ts

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { authenticate, requireScope } from './auth';

function safeTokenEquals(provided: string, expected: string): boolean {
    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

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

    if (!token || !safeTokenEquals(token, configuredToken)) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
        });
    }

    next();
};

/**
 * Authorizes admin log access via either the static ADMIN_LOGS_TOKEN
 * or a standard Public API credential (API key / JWT) with 'admin:logs:read' scope.
 */
export const authorizeAdminLogs = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    const configuredToken = process.env.ADMIN_LOGS_TOKEN;

    if (authHeader?.startsWith('Bearer ') && configuredToken) {
        const token = authHeader.substring(7).trim();
        if (token && safeTokenEquals(token, configuredToken)) {
            next();
            return;
        }
    }

    authenticate(req, res, (err?: unknown) => {
        if (err) {
            next(err);
            return;
        }
        requireScope('admin:logs:read')(req, res, next);
    });
};