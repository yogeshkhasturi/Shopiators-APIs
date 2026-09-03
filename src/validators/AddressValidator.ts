import { z } from 'zod';

export const AddressCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  house: z.string().min(1, 'House/Flat/Building is required'),
  street: z.string().min(1, 'Street is required'),
  landmark: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  stateName: z.string().min(1, 'State name is required'),
  country: z.string().optional(),
  countryName: z.string().min(1, 'Country name is required'),
  pincode: z.string().min(1, 'Pincode is required').max(20),
  phone: z.string().min(1, 'Phone is required'),
  addressType: z.enum(['Home', 'Work', 'Other']).default('Home'),
  isDefault: z.boolean().default(false),
}).passthrough();

export const AddressUpdateSchema = AddressCreateSchema.partial();
