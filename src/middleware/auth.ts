import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/ApiKeyService';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        storeSlug: string;
        scopes: string[];
        authType: 'api_key' | 'jwt';
        userId?: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header'
        }
      });
      return;
    }
    
    const token = authHeader.substring(7);
    
    if (token.startsWith('sk_live_')) {
      const credential = await ApiKeyService.validateKey(token);
      
      if (!credential) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API Key' } });
        return;
      }
      
      req.tenant = {
        storeSlug: credential.storeSlug,
        scopes: credential.scopes || [],
        authType: 'api_key'
      };
      return next();
    }

    // JWT authentication
    const secret = process.env.PUBLIC_API_JWT_SECRET;
    if (!secret) {
      throw new Error('Server configuration error');
    }

    try {
      const decoded = jwt.verify(token, secret) as any;
      if (decoded.type !== 'public_api_access') {
        throw new Error('Invalid token type');
      }

      req.tenant = {
        storeSlug: decoded.storeSlug,
        scopes: decoded.scopes || [],
        authType: 'jwt',
        userId: decoded.sub
      };
      return next();
    } catch (err) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
      return;
    }
    
  } catch (error) {
    next(error);
  }
};

export const requireScope = (requiredScope: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
       res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    
    if (!req.tenant.scopes.includes(requiredScope) && !req.tenant.scopes.includes('all')) {
       res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: `Missing required scope: ${requiredScope}` } });
      return;
    }
    
    next();
  };
};
