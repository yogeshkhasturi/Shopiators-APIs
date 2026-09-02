import { z } from 'zod';

export const CreateVariantSchema = z.object({
  attributes: z.record(z.string(), z.string()).optional(),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  sku: z.string().optional()
}).strict();

export const UpdateVariantSchema = CreateVariantSchema.partial();
