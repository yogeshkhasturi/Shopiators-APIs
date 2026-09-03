import { z } from 'zod';
import { AddressCreateSchema } from './AddressValidator';

export const CustomerQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1 as any),
  limit: z.string().regex(/^\d+$/).transform(Number).default(25 as any),
  search: z.string().optional(),
});

export const CustomerCreateSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  phoneNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  businessType: z.string().optional(),
  
  // Optional inline address
  address: AddressCreateSchema.optional(),
}).passthrough();

export const CustomerUpdateSchema = z.object({
  userName: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  phoneNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  businessType: z.string().optional(),
}).passthrough();
