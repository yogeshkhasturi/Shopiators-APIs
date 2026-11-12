import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/StoreService';
import { StoreSerializer } from '../serializers/StoreSerializer';

export class StoreController {
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const result = await StoreService.getStoreMetadata(storeSlug);

      if (!result) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Store not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: StoreSerializer.serialize(result.store, {
          currency: result.currency,
          productCount: result.productCount,
        }),
      });
    } catch (error) {
      next(error);
    }
  }
}

