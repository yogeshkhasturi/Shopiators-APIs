import { Request, Response, NextFunction } from 'express';
import { AuthLoginSchema, AuthRefreshSchema } from '../validators/AuthValidator';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate input
      const data = AuthLoginSchema.parse(req.body);

      // Authenticate
      const result = await AuthService.login(data.storeSlug, data.email, data.password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials.'
          }
        });
        return;
      }
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AuthRefreshSchema.parse(req.body);
      const result = await AuthService.refresh(data.refreshToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token.'
          }
        });
        return;
      }
      next(error);
    }
  }
}
