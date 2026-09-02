import { z } from 'zod';

export const AttributeQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
  sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).optional(),
});

export const AttributeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  attributeset: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
  values: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')).optional(),
});

export const AttributeUpdateSchema = AttributeCreateSchema.partial();
