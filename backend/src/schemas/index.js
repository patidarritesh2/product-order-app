const { z } = require('zod');

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'must be at least 3 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers and underscore only'),
  // bcrypt only uses the first 72 bytes
  password: z.string().min(8, 'must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'required'),
  password: z.string().min(1, 'required'),
});

const productSchema = z.object({
  name: z.string().trim().min(1, 'required').max(120),
  price: z.number({ invalid_type_error: 'must be a number' }).min(0, 'must be >= 0'),
  description: z.string().trim().max(1000).default(''),
});

const orderSchema = z.object({
  productIds: z
    .array(
      z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'invalid product id')
        .transform((s) => s.toLowerCase())
    )
    .min(1, 'at least one product is required'),
});

module.exports = { registerSchema, loginSchema, productSchema, orderSchema };
