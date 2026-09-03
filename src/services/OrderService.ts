import crypto from 'crypto';
const Order = require('../../models/Order');

interface OrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  sort?: string;
}

export class OrderService {
  static async list(storeSlug: string, query: OrderQuery) {
    const { 
      page = 1, 
      limit = 25, 
      search, 
      status, 
      paymentStatus,
      sort = '-createdAt'
    } = query;

    const filter: any = { storeSlug };

    if (search) {
      filter.$or = [
        { customOrderId: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.orderStatus = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(storeSlug: string, id: string) {
    const order = await Order.findOne({ _id: id, storeSlug }).lean();
    if (!order) {
      const error: any = new Error('Order not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return order;
  }

  static async create(storeSlug: string, data: any) {
    // Auto-generate customOrderId if not provided
    if (!data.customOrderId) {
      const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
      data.customOrderId = `ORD-${Date.now()}-${randomPart}`;
    }

    const order = new Order({
      ...data,
      storeSlug,
    });
    
    await order.save();
    return order.toObject();
  }

  static async update(storeSlug: string, id: string, data: any) {
    // We allow deep merge updates for nested objects like refund, return, cancel
    const order = await Order.findOne({ _id: id, storeSlug });
    if (!order) {
      const error: any = new Error('Order not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Manual merge for top level and 1-level deep
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
        if (!order[key]) order[key] = {};
        for (const nestedKey of Object.keys(data[key])) {
          order[key][nestedKey] = data[key][nestedKey];
        }
      } else {
        order[key] = data[key];
      }
    }

    order.orderUpdateDate = new Date();
    await order.save();
    return order.toObject();
  }
}
