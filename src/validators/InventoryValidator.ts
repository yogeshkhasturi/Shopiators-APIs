import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true');

export const InventoryAlertsQuerySchema = z.object({
  threshold: z
    .string()
    .regex(/^\d+$/, 'threshold must be a non-negative integer')
    .transform(Number)
    .refine((n) => n >= 0 && n <= 10000, 'threshold must be between 0 and 10000')
    .default(5 as any),
  includeOutOfStock: booleanString.default(true as any),
  includeDisabled: booleanString.default(false as any),
  page: z
    .string()
    .regex(/^\d+$/, 'page must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1, 'page must be at least 1')
    .default(1 as any),
  limit: z
    .string()
    .regex(/^\d+$/, 'limit must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, 'limit must be between 1 and 100')
    .default(25 as any),
});

export type InventoryAlertsQuery = z.infer<typeof InventoryAlertsQuerySchema>;

