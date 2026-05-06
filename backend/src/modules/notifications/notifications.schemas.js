const { z } = require('zod');

const markReadSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ read: z.boolean().default(true) }),
  query: z.object({}).optional()
});

module.exports = { markReadSchema };
