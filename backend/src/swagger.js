const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: "Children's Literacy Learning Platform API",
    version: '1.0.0',
    description: 'REST API for parent onboarding, child profiles, curriculum, progress, gamification, notifications, and admin monitoring.'
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: { type: 'object', properties: { message: { type: 'string' }, details: { type: 'object' } } },
      LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } },
      RegisterRequest: { type: 'object', required: ['email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } },
      ChildCreate: { type: 'object', required: ['displayName', 'age'], properties: { displayName: { type: 'string' }, age: { type: 'integer' }, avatarUrl: { type: 'string' }, learningLevel: { type: 'string' } } },
      LocalizedText: { type: 'object', properties: { en: { type: 'string' }, kk: { type: 'string' }, ru: { type: 'string' } } },
      UnitCreate: { type: 'object', required: ['title', 'orderNo'], properties: { title: { $ref: '#/components/schemas/LocalizedText' }, description: { $ref: '#/components/schemas/LocalizedText' }, orderNo: { type: 'integer' }, difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] }, published: { type: 'boolean' } } },
      LessonCreate: { type: 'object', required: ['unitId', 'title', 'orderNo'], properties: { unitId: { type: 'string' }, title: { $ref: '#/components/schemas/LocalizedText' }, instructions: { $ref: '#/components/schemas/LocalizedText' }, orderNo: { type: 'integer' }, xpReward: { type: 'integer' }, published: { type: 'boolean' } } },
      ExerciseCreate: { type: 'object', required: ['type', 'prompt', 'correctAnswer', 'orderNo'], properties: { type: { type: 'string', enum: ['PHONICS', 'HANDWRITING', 'SIGHT_WORDS', 'VOCABULARY'] }, prompt: { $ref: '#/components/schemas/LocalizedText' }, options: { type: 'array', items: { type: 'string' } }, correctAnswer: { type: 'string' }, orderNo: { type: 'integer' } } }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': { post: { security: [], summary: 'Register a parent account', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } }, responses: { '201': { description: 'Created' }, '422': { description: 'Validation error' } } } },
    '/auth/login': { post: { security: [], summary: 'Login and receive access/refresh tokens', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } }, responses: { '200': { description: 'OK' }, '401': { description: 'Invalid credentials' } } } },
    '/auth/refresh': { post: { security: [], summary: 'Refresh tokens', responses: { '200': { description: 'OK' } } } },
    '/auth/logout': { post: { security: [], summary: 'Revoke refresh token', responses: { '204': { description: 'Logged out' } } } },
    '/children': { get: { summary: 'List children with pagination', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create a child profile', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ChildCreate' } } } }, responses: { '201': { description: 'Created' } } } },
    '/children/{id}': { get: { summary: 'Get child by id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }, put: { summary: 'Update child profile', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }, delete: { summary: 'Delete child profile', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Deleted' } } } },
    '/children/{id}/progress': { get: { summary: 'Get child learning history', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/children/{id}/badges': { get: { summary: 'Get child badges', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/units': { get: { summary: 'List units', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create unit admin only', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UnitCreate' } } } }, responses: { '201': { description: 'Created' } } } },
    '/units/{id}': { get: { summary: 'Get unit', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }, put: { summary: 'Update unit admin only', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }, delete: { summary: 'Delete unit admin only', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'Deleted' } } } },
    '/lessons': { get: { summary: 'List lessons with filters', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create lesson admin only', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LessonCreate' } } } }, responses: { '201': { description: 'Created' } } } },
    '/lessons/{id}/complete': { post: { summary: 'Complete lesson, award XP and badges', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { childId: { type: 'string' } } } } } }, responses: { '201': { description: 'Completed' } } } },
    '/lessons/{lessonId}/exercises': { get: { summary: 'List lesson exercises', parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }, post: { summary: 'Create exercise admin only', parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ExerciseCreate' } } } }, responses: { '201': { description: 'Created' } } } },
    '/exercises/{id}/submit': { post: { summary: 'Submit exercise answer', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Recorded' } } } },
    '/notifications': { get: { summary: 'List notifications', responses: { '200': { description: 'OK' } } } },
    '/notifications/{id}': { patch: { summary: 'Mark notification read/unread', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/leaderboard': { get: { summary: 'XP leaderboard by age group', responses: { '200': { description: 'OK' } } } },
    '/admin/logs': { get: { summary: 'Admin activity logs', responses: { '200': { description: 'OK' } } } },
    '/admin/stats': { get: { summary: 'Admin platform statistics', responses: { '200': { description: 'OK' } } } }
  }
};

module.exports = swaggerDocument;
