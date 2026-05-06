const { z } = require('zod');

const uuidParam = z.object({ id: z.string().uuid() });

const createChildSchema = z.object({
  body: z.object({
    displayName: z.string().min(2).max(80),
    age: z.number().int().min(3).max(12),
    avatarUrl: z.string().url().optional(),
    learningLevel: z.string().min(2).max(50).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateChildSchema = z.object({
  body: z.object({
    displayName: z.string().min(2).max(80).optional(),
    age: z.number().int().min(3).max(12).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    learningLevel: z.string().min(2).max(50).optional()
  }).refine((data) => Object.keys(data).length > 0, 'At least one field is required'),
  params: uuidParam,
  query: z.object({}).optional()
});

const childIdSchema = z.object({
  body: z.object({}).optional(),
  params: uuidParam,
  query: z.object({}).catchall(z.string().optional()).optional()
});

module.exports = { createChildSchema, updateChildSchema, childIdSchema };
