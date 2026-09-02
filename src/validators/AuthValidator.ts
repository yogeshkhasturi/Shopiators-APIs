import { z } from 'zod';

export const AuthLoginSchema = z.object({
  storeSlug: z.string().min(1, 'Store slug is required').max(100),
  email: z.string().email('Invalid email format').max(255).toLowerCase().trim(),
  password: z.string().min(1, 'Password is required').max(1000)
});
