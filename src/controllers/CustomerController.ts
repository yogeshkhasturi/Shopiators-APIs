import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/CustomerService';
import { CustomerSerializer } from '../serializers/CustomerSerializer';
import { CustomerQuerySchema, CustomerCreateSchema, CustomerUpdateSchema } from '../validators/CustomerValidator';

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const query = CustomerQuerySchema.parse(req.query);
      
      const { customers, pagination } = await CustomerService.list(storeSlug, query);
      
      res.json({
        success: true,
        data: CustomerSerializer.serializeMany(customers),
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      
      const customer = await CustomerService.getById(storeSlug, id);
      
      res.json({
        success: true,
        data: CustomerSerializer.serialize(customer)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const validatedData = CustomerCreateSchema.parse(req.body);
      
      const customer = await CustomerService.create(storeSlug, validatedData);
      
      res.status(201).json({
        success: true,
        data: CustomerSerializer.serialize(customer)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      const validatedData = CustomerUpdateSchema.parse(req.body);
      
      const customer = await CustomerService.update(storeSlug, id, validatedData);
      
      res.json({
        success: true,
        data: CustomerSerializer.serialize(customer)
      });
    } catch (error) {
      next(error);
    }
  }
}
