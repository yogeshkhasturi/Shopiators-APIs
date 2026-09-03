import { Types } from 'mongoose';

export class OrderSerializer {
  static serialize(order: any) {
    if (!order) return null;

    // Convert mongoose document to plain object if necessary
    const orderObj = order.toObject ? order.toObject() : order;

    // Extract id and remove internal fields
    const { _id, __v, storeSlug, ...rest } = orderObj;

    return {
      id: _id ? _id.toString() : undefined,
      ...rest,
    };
  }

  static serializeMany(orders: any[]) {
    return orders.map((order) => this.serialize(order));
  }
}
