import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password is too long'),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long'),
  role: z.enum(['buyer', 'artisan']),
  location: z.string().max(255, 'Location is too long').optional(),
});

export const OTPVerifySchema = z.object({
  email: z.string().email('Invalid email'),
  otp_code: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

export const Admin2FASchema = z.object({
  totp_code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
});

export const AdminBackupCodeSchema = z.object({
  backup_code: z
    .string()
    .length(8, 'Backup code must be 8 characters')
    .regex(/^[a-f0-9]{8}$/, 'Invalid backup code format'),
});

// ============================================================================
// ARTISAN SCHEMAS
// ============================================================================

export const ArtisanProfileSchema = z.object({
  full_name: z.string().min(2).max(255),
  bio: z.string().max(1000).optional(),
  craft_specialty: z.string().max(255).optional(),
  years_experience: z.number().min(0).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone number')
    .optional(),
  location: z.string().max(255).optional(),
  portfolio_url: z.string().url('Invalid URL').optional(),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const ProductFilterSchema = z.object({
  q: z.string().max(200).optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  location: z.string().max(100).optional(),
  craft_type: z.string().max(100).optional(),
  rating_min: z.number().min(0).max(5).optional(),
  date: z.enum(['last_7_days', 'last_30_days', 'all']).optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).optional(),
});

export const ProductCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(255, 'Product name is too long'),
  price_ugx: z
    .number()
    .min(1000, 'Price must be at least 1,000 UGX')
    .max(100000000, 'Price is too high'),
  price_usd: z
    .number()
    .min(0.01, 'Price must be at least $0.01')
    .max(1000000, 'Price is too high'),
  story: z
    .string()
    .min(10, 'Product story must be at least 10 characters')
    .max(5000, 'Product story is too long'),
  craft_specialty: z.string().max(255).optional(),
  material: z.string().max(500).optional(),
  technique: z.string().max(500).optional(),
  days_to_make: z.number().min(1).max(365).optional(),
  is_customisable: z.boolean().default(false),
  artisan_pct: z.number().min(0).max(100).default(85),
  platform_pct: z.number().min(0).max(100).default(12),
  heritage_pct: z.number().min(0).max(100).default(3),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const CartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(1000),
  customization_notes: z.string().max(1000).optional(),
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Cart must have at least one item'),
});

export const CheckoutSchema = z.object({
  buyer_name: z.string().min(2).max(255),
  buyer_email: z.string().email('Invalid email'),
  buyer_phone: z.string().regex(/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone number'),
  delivery_address: z.string().min(5).max(500),
  delivery_city: z.string().min(2).max(100),
  delivery_country: z.string().min(2).max(100),
  payment_method: z.enum(['stripe', 'mtn_momo', 'airtel_money', 'ton', 'manual']),
  is_gift: z.boolean().default(false),
  gift_message: z.string().max(500).optional(),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept terms'),
});

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query required').max(200),
  filters: z
    .object({
      price_min: z.number().min(0).optional(),
      price_max: z.number().min(0).optional(),
      location: z.string().max(100).optional(),
      craft_type: z.string().max(100).optional(),
      rating_min: z.number().min(0).max(5).optional(),
      date: z.enum(['last_7_days', 'last_30_days', 'all']).optional(),
    })
    .optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).optional(),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const PaymentInitiateSchema = z.object({
  order_id: z.number().int().positive(),
  payment_method: z.enum(['stripe', 'mtn_momo', 'airtel_money', 'ton', 'manual']),
  phone_number: z
    .string()
    .regex(/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone number')
    .optional(),
});

export const StripeCheckoutSchema = z.object({
  order_id: z.number().int().positive(),
  client_secret: z.string(),
});

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const AdminCreateUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[0-9]/, 'Password must contain numbers')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
  full_name: z.string().min(2).max(255),
  is_staff: z.boolean(),
  is_superuser: z.boolean().optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type OTPVerifyInput = z.infer<typeof OTPVerifySchema>;
export type ProductFilterInput = z.infer<typeof ProductFilterSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
export type PaymentInitiateInput = z.infer<typeof PaymentInitiateSchema>;

export const validateInput = async <T>(schema: z.ZodSchema, data: unknown): Promise<[T | null, string | null]> => {
  try {
    const validated = schema.parse(data);
    return [validated as T, null];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || 'Validation failed';
      return [null, message];
    }
    return [null, 'Validation failed'];
  }
};
