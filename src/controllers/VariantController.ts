import { Request, Response, NextFunction } from 'express';
import { VariantService } from '../services/VariantService';
import { VariantSerializer } from '../serializers/VariantSerializer';
import { CreateVariantSchema, UpdateVariantSchema } from '../validators/VariantValidator';

export class VariantController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const { productId } = req.params as { productId: string, id: string };
      
      const variants = await VariantService.list(storeSlug, productId);
      
      res.json({
        success: true,
        data: VariantSerializer.serializeMany(variants)
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const { productId, id } = req.params as { productId: string, id: string };
      
      const variant = await VariantService.getById(storeSlug, productId, id);
      
      if (!variant) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Variant not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: VariantSerializer.serialize(variant)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const { productId } = req.params as { productId: string, id: string };
      const data = CreateVariantSchema.parse(req.body);
      
      const variant = await VariantService.create(storeSlug, productId, data);
      
      res.status(201).json({
        success: true,
        data: VariantSerializer.serialize(variant)
      });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Product not found' }
        });
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const { productId, id } = req.params as { productId: string, id: string };
      const data = UpdateVariantSchema.parse(req.body);
      
      const variant = await VariantService.update(storeSlug, productId, id, data);
      
      if (!variant) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Variant not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: VariantSerializer.serialize(variant)
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const { productId, id } = req.params as { productId: string, id: string };
      
      const variant = await VariantService.delete(storeSlug, productId, id);
      
      if (!variant) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Variant not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: { id }
      });
    } catch (error) {
      next(error);
    }
  }
}
