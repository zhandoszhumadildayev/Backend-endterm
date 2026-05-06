const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(100)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { registerSchema, loginSchema, refreshSchema };
