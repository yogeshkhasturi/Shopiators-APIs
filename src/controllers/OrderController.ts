import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService';
import { OrderSerializer } from '../serializers/OrderSerializer';
import { OrderQuerySchema, OrderCreateSchema, OrderUpdateSchema } from '../validators/OrderValidator';

export class OrderController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const query = OrderQuerySchema.parse(req.query);
      
      const { orders, pagination } = await OrderService.list(storeSlug, query);
      
      res.json({
        success: true,
        data: OrderSerializer.serializeMany(orders),
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
      
      const order = await OrderService.getById(storeSlug, id);
      
      res.json({
        success: true,
        data: OrderSerializer.serialize(order)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const validatedData = OrderCreateSchema.parse(req.body);
      
      const order = await OrderService.create(storeSlug, validatedData);
      
      res.status(201).json({
        success: true,
        data: OrderSerializer.serialize(order)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeSlug = req.tenant!.storeSlug;
      const id = req.params.id as string;
      const validatedData = OrderUpdateSchema.parse(req.body);
      
      const order = await OrderService.update(storeSlug, id, validatedData);
      
      res.json({
        success: true,
        data: OrderSerializer.serialize(order)
      });
    } catch (error) {
      next(error);
    }
  }
}
