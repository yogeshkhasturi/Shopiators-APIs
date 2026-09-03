import { z } from 'zod';
import { Types } from 'mongoose';

// Reusable ObjectId validator
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const OrderQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1 as any),
  limit: z.string().regex(/^\d+$/).transform(Number).default(25 as any),
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  sort: z.enum(['createdAt', '-createdAt', 'totalAmount', '-totalAmount']).default('-createdAt')
});

const AddressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
}).passthrough();

const CartItemSchema = z.object({
  productId: z.string(),
  title: z.string(),
  image: z.array(z.string()).optional(),
  price: z.number(),
  quantity: z.number(),
  sku: z.string().optional(),
  selectedVariant: objectIdSchema.optional(),
  selectedOptions: z.record(z.string(), z.any()).optional(),
  attributeDetails: z.array(z.object({
    attributeId: z.string().optional(),
    attributeName: z.string().optional(),
    attributeValueId: z.string().optional(),
    attributeValueName: z.string().optional(),
  })).optional(),
}).passthrough();

export const OrderCreateSchema = z.object({
  customOrderId: z.string().optional(),
  userId: z.string().optional(),
  cartId: z.string().optional(),
  cartItems: z.array(CartItemSchema).min(1),
  
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  contactEmail: z.string().email('Invalid email address').optional(),
  contactPhone: z.string().optional(),
  
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  orderStatus: z.string().default('pending'),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().default('pending'),
  
  subTotal: z.number(),
  shippingCharge: z.number().default(0),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  discountCode: z.string().optional(),
  totalAmount: z.number(),
  currency: z.string().default('USD'),
}).passthrough(); // Allow other fields that might be mapped automatically

export const OrderUpdateSchema = z.object({
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentId: z.string().optional(),
  payerId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  trackingInfo: z.array(z.object({
    trackingNumber: z.string(),
    shippingCarrier: z.string(),
    trackingUrl: z.string().optional(),
  })).optional(),
  refund: z.object({
    status: z.string().optional(),
    adminRemark: z.string().optional(),
  }).passthrough().optional(),
  return: z.object({
    status: z.string().optional(),
    adminRemark: z.string().optional(),
  }).passthrough().optional(),
  cancel: z.object({
    status: z.string().optional(),
    adminRemark: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();
