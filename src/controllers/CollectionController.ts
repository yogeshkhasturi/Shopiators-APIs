import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../services/CollectionService';
import { CollectionSerializer } from '../serializers/CollectionSerializer';
import { CollectionCreateSchema, CollectionUpdateSchema, CollectionQuerySchema } from '../validators/CollectionValidator';

export class CollectionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = CollectionQuerySchema.parse(req.query);
      const result = await CollectionService.list(req.tenant!.storeSlug, query);
      
      res.json({
        success: true,
        data: CollectionSerializer.serializeList(result.collections),
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await CollectionService.getById(req.tenant!.storeSlug, req.params.id as string);
      if (!collection) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Collection not found' } });
        return;
      }
      res.json({ success: true, data: CollectionSerializer.serialize(collection) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CollectionCreateSchema.parse(req.body);
      const collection = await CollectionService.create(req.tenant!.storeSlug, data);
      res.status(201).json({ success: true, data: CollectionSerializer.serialize(collection) });
    } catch (error: any) {
      if (error.message.includes('do not exist or belong to another store')) {
        res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: error.message } });
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CollectionUpdateSchema.parse(req.body);
      const collection = await CollectionService.update(req.tenant!.storeSlug, req.params.id as string, data);
      
      if (!collection) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Collection not found' } });
        return;
      }
      
      res.json({ success: true, data: CollectionSerializer.serialize(collection) });
    } catch (error: any) {
      if (error.message.includes('do not exist or belong to another store')) {
        res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: error.message } });
        return;
      }
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await CollectionService.delete(req.tenant!.storeSlug, req.params.id as string);
      
      if (!collection) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Collection not found' } });
        return;
      }
      
      res.json({ success: true, message: 'Collection deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
