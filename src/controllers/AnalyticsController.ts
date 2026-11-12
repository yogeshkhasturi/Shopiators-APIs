import { Request, Response, NextFunction } from 'express';
import { SalesAnalyticsQuerySchema } from '../validators/AnalyticsValidator';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  static async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const query = SalesAnalyticsQuerySchema.parse(req.query);
      const data = await AnalyticsService.getSalesAnalytics(storeSlug, query);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

