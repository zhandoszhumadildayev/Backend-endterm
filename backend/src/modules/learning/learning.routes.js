const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');
const { submissionLimiter } = require('../../middlewares/rateLimit');
const service = require('./learning.service');
const { submitExerciseSchema, completeLessonSchema } = require('./learning.schemas');

const router = express.Router();
router.use(authenticate);

router.post('/exercises/:id/submit', submissionLimiter, validate(submitExerciseSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.submitExercise(req.user, req.validated.params.id, req.validated.body));
}));

router.post('/lessons/:id/complete', validate(completeLessonSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.completeLesson(req.user, req.validated.params.id, req.validated.body));
}));

module.exports = router;
