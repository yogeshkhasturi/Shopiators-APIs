import { z } from 'zod';

export const AttributeSetQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
  sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const AttributeSetCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  status: z.enum(['active', 'inactive']).optional(),
});

export const AttributeSetUpdateSchema = AttributeSetCreateSchema.partial();
