import { z } from 'zod';

export const ProductQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
  handle: z.string().max(255).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'price', '-price', 'title', '-title']).optional(),
});

const ProductBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  handle: z.string().max(255).optional(),
  description: z.string().max(10000).optional(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional(),
  totalStock: z.number().min(0).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  selectedCollections: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')).optional(),
  selectedCollection: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(1000).optional(),
  images: z.array(z.string()).optional(),
  sizeChart: z.string().url().optional(),
  options: z.array(z.object({
    name: z.string().min(1).max(100),
    values: z.array(z.string().min(1).max(100))
  })).optional()
});

export const ProductCreateSchema = ProductBaseSchema.refine((data) => {
  if (data.price !== undefined && data.comparePrice !== undefined) {
    return data.price <= data.comparePrice;
  }
  return true;
}, {
  message: "price should be less than compare at price",
  path: ["price"]
});

export const ProductUpdateSchema = ProductBaseSchema.partial().refine((data) => {
  if (data.price !== undefined && data.comparePrice !== undefined) {
    return data.price <= data.comparePrice;
  }
  return true;
}, {
  message: "price should be less than compare at price",
  path: ["price"]
});
