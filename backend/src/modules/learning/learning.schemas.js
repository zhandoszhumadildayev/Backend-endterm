const { z } = require('zod');

const uuid = z.string().uuid();

const submitExerciseSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    childId: uuid,
    answer: z.string().min(1),
    timeTakenSeconds: z.number().int().min(0).max(3600)
  }),
  query: z.object({}).optional()
});

const completeLessonSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ childId: uuid }),
  query: z.object({}).optional()
});

module.exports = { submitExerciseSchema, completeLessonSchema };
