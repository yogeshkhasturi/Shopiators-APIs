import { AddressService } from './AddressService';
import bcrypt from 'bcryptjs';

const User = require('../../models/User');

interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export class CustomerService {
  static async list(storeSlug: string, query: CustomerQuery) {
    const { page = 1, limit = 25, search } = query;

    const filter: any = { storeSlug, role: 'user' };

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      User.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(storeSlug: string, id: string) {
    const customer = await User.findOne({ _id: id, storeSlug, role: 'user' }).lean();
    if (!customer) {
      const error: any = new Error('Customer not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return customer;
  }

  static async create(storeSlug: string, data: any) {
    const { address, password, ...customerData } = data;

    // Check if customer email/username already exists
    const queryCond: any[] = [];
    if (customerData.email) queryCond.push({ email: customerData.email });
    if (customerData.userName) queryCond.push({ userName: customerData.userName });
    
    if (queryCond.length > 0) {
      const existing = await User.findOne({
        storeSlug,
        role: 'user',
        $or: queryCond
      });
      if (existing) {
        const error: any = new Error('Customer with this email or username already exists');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = new User({
      ...customerData,
      password: hashedPassword,
      storeSlug,
      role: 'user', // Always force 'user' for customers
    });
    
    await customer.save();

    // Create address if provided
    if (address) {
      try {
        await AddressService.create(storeSlug, customer._id.toString(), address);
      } catch (err) {
        console.error('Failed to create inline address for customer', err);
        // We do not fail customer creation if address fails, but ideally it should be a transaction.
      }
    }

    return customer.toObject();
  }

  static async update(storeSlug: string, id: string, data: any) {
    const customer = await User.findOne({ _id: id, storeSlug, role: 'user' });
    if (!customer) {
      const error: any = new Error('Customer not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    Object.assign(customer, data);
    await customer.save();
    
    return customer.toObject();
  }
}
