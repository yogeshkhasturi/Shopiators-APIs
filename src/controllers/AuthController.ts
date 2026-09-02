import { Request, Response, NextFunction } from 'express';
import { AuthLoginSchema } from '../validators/AuthValidator';
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
}
