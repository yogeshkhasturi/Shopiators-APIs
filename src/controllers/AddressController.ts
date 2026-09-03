import { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/AddressService';
import { AddressSerializer } from '../serializers/AddressSerializer';
import { AddressCreateSchema, AddressUpdateSchema } from '../validators/AddressValidator';

export class AddressController {
  static async listByCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const customerId = req.params.customerId as string;
      
      const addresses = await AddressService.listByCustomer(storeSlug, customerId);
      
      res.json({
        success: true,
        data: AddressSerializer.serializeMany(addresses),
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      
      const address = await AddressService.getById(storeSlug, id);
      
      res.json({
        success: true,
        data: AddressSerializer.serialize(address)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const customerId = req.params.customerId as string;
      const validatedData = AddressCreateSchema.parse(req.body);
      
      const address = await AddressService.create(storeSlug, customerId, validatedData);
      
      res.status(201).json({
        success: true,
        data: AddressSerializer.serialize(address)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      const validatedData = AddressUpdateSchema.parse(req.body);
      
      const address = await AddressService.update(storeSlug, id, validatedData);
      
      res.json({
        success: true,
        data: AddressSerializer.serialize(address)
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      
      await AddressService.delete(storeSlug, id);
      
      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}
