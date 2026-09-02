import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { ProductSerializer } from '../serializers/ProductSerializer';
import { ProductCreateSchema, ProductUpdateSchema, ProductQuerySchema } from '../validators/ProductValidator';

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const queryParams = ProductQuerySchema.parse(req.query);
      
      const result = await ProductService.list(storeSlug, queryParams);
      
      res.json({
        success: true,
        data: ProductSerializer.serializeMany(result.products),
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const product = await ProductService.getById(storeSlug, req.params.id as string);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Product not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: ProductSerializer.serialize(product)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const data = ProductCreateSchema.parse(req.body);
      
      const product = await ProductService.create(storeSlug, data);
      
      res.status(201).json({
        success: true,
        data: ProductSerializer.serialize(product)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const data = ProductUpdateSchema.parse(req.body);
      
      const product = await ProductService.update(storeSlug, req.params.id as string, data);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Product not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: ProductSerializer.serialize(product)
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const product = await ProductService.delete(storeSlug, req.params.id as string);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Product not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: { id: req.params.id as string }
      });
    } catch (error) {
      next(error);
    }
  }
}
