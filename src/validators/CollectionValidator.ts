import { z } from 'zod';

export const CollectionQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
  handle: z.string().max(255).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'title', '-title']).optional(),
});

export const CollectionCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  handle: z.string().max(255).optional(),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional(),
  collectionType: z.enum(['manual', 'smart']).optional(),
  selectedProducts: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(1000).optional()
});

export const CollectionUpdateSchema = CollectionCreateSchema.partial();
