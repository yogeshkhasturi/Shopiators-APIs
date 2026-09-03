import { Request, Response, NextFunction } from 'express';
import { AttributeSetService } from '../services/AttributeSetService';
import { AttributeSetSerializer } from '../serializers/AttributeSetSerializer';
import { AttributeSetCreateSchema, AttributeSetUpdateSchema, AttributeSetQuerySchema } from '../validators/AttributeSetValidator';

export class AttributeSetController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const queryParams = AttributeSetQuerySchema.parse(req.query);
      
      const result = await AttributeSetService.list(storeSlug, queryParams);
      
      res.json({
        success: true,
        data: AttributeSetSerializer.serializeMany(result.attributeSets),
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const attributeSet = await AttributeSetService.getById(storeSlug, req.params.id as string);
      
      if (!attributeSet) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Attribute set not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: AttributeSetSerializer.serialize(attributeSet)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const data = AttributeSetCreateSchema.parse(req.body);
      
      const attributeSet = await AttributeSetService.create(storeSlug, data);
      
      res.status(201).json({
        success: true,
        data: AttributeSetSerializer.serialize(attributeSet)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const data = AttributeSetUpdateSchema.parse(req.body);
      
      const attributeSet = await AttributeSetService.update(storeSlug, req.params.id as string, data);
      
      if (!attributeSet) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Attribute set not found' }
        });
        return;
      }
      
      res.json({
        success: true,
        data: AttributeSetSerializer.serialize(attributeSet)
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const attributeSet = await AttributeSetService.delete(storeSlug, req.params.id as string);
      
      if (!attributeSet) {
        res.status(404).json({
          success: false,
          error: { code: 'RESOURCE_NOT_FOUND', message: 'Attribute set not found' }
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
