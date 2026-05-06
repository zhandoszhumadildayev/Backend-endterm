const { z } = require('zod');

const localized = z.record(z.string().min(2).max(5), z.string().min(1)).or(z.object({ en: z.string().min(1) }).catchall(z.string().min(1)));
const difficulty = z.enum(['EASY', 'MEDIUM', 'HARD']);
const exerciseType = z.enum(['PHONICS', 'HANDWRITING', 'SIGHT_WORDS', 'VOCABULARY']);
const uuid = z.string().uuid();

const unitCreateSchema = z.object({
  body: z.object({
    title: localized,
    description: localized.optional(),
    orderNo: z.number().int().min(1),
    difficulty: difficulty.optional(),
    published: z.boolean().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const unitUpdateSchema = z.object({
  body: unitCreateSchema.shape.body.partial(),
  params: z.object({ id: uuid }),
  query: z.object({}).optional()
});

const lessonCreateSchema = z.object({
  body: z.object({
    unitId: uuid,
    title: localized,
    instructions: localized.optional(),
    orderNo: z.number().int().min(1),
    difficulty: difficulty.optional(),
    xpReward: z.number().int().min(1).max(100).optional(),
    published: z.boolean().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const lessonUpdateSchema = z.object({
  body: lessonCreateSchema.shape.body.partial(),
  params: z.object({ id: uuid }),
  query: z.object({}).optional()
});

const exerciseCreateSchema = z.object({
  body: z.object({
    type: exerciseType,
    prompt: localized,
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().min(1),
    orderNo: z.number().int().min(1),
    difficulty: difficulty.optional()
  }),
  params: z.object({ lessonId: uuid }),
  query: z.object({}).optional()
});

const exerciseUpdateSchema = z.object({
  body: exerciseCreateSchema.shape.body.partial(),
  params: z.object({ id: uuid }),
  query: z.object({}).optional()
});

const idSchema = z.object({ body: z.object({}).optional(), params: z.object({ id: uuid }), query: z.object({}).catchall(z.string().optional()).optional() });
const lessonIdSchema = z.object({ body: z.object({}).optional(), params: z.object({ lessonId: uuid }), query: z.object({}).catchall(z.string().optional()).optional() });

module.exports = { unitCreateSchema, unitUpdateSchema, lessonCreateSchema, lessonUpdateSchema, exerciseCreateSchema, exerciseUpdateSchema, idSchema, lessonIdSchema };
