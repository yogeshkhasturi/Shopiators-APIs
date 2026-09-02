import { Request, Response, NextFunction } from 'express';
import { AttributeService } from '../services/AttributeService';
import { AttributeSerializer } from '../serializers/AttributeSerializer';
import { AttributeCreateSchema, AttributeUpdateSchema, AttributeQuerySchema } from '../validators/AttributeValidator';

export class AttributeController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = AttributeQuerySchema.parse(req.query);
      const result = await AttributeService.list(req.tenant!.storeSlug, query);
      
      res.json({
        success: true,
        data: AttributeSerializer.serializeList(result.attributes),
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const attribute = await AttributeService.getById(req.tenant!.storeSlug, req.params.id as string);
      if (!attribute) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attribute not found' } });
        return;
      }
      res.json({ success: true, data: AttributeSerializer.serialize(attribute) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AttributeCreateSchema.parse(req.body);
      const attribute = await AttributeService.create(req.tenant!.storeSlug, data);
      res.status(201).json({ success: true, data: AttributeSerializer.serialize(attribute) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = AttributeUpdateSchema.parse(req.body);
      const attribute = await AttributeService.update(req.tenant!.storeSlug, req.params.id as string, data);
      
      if (!attribute) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attribute not found' } });
        return;
      }
      
      res.json({ success: true, data: AttributeSerializer.serialize(attribute) });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const attribute = await AttributeService.delete(req.tenant!.storeSlug, req.params.id as string);
      
      if (!attribute) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attribute not found' } });
        return;
      }
      
      res.json({ success: true, message: 'Attribute deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
