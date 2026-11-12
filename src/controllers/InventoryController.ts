import { Request, Response, NextFunction } from 'express';
import { InventoryAlertsQuerySchema } from '../validators/InventoryValidator';
import { InventoryService } from '../services/InventoryService';

export class InventoryController {
  static async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const query = InventoryAlertsQuerySchema.parse(req.query);
      const result = await InventoryService.getAlerts(storeSlug, query);

      res.json({
        success: true,
        data: result.alerts,
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

