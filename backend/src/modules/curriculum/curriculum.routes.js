const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middlewares/validate');
const { authenticate, requireRole } = require('../../middlewares/auth');
const service = require('./curriculum.service');
const schemas = require('./curriculum.schemas');

const router = express.Router();
router.use(authenticate);

router.get('/units', asyncHandler(async (req, res) => {
  res.json(await service.listUnits(req.user, req.query));
}));

router.post('/units', requireRole('ADMIN'), validate(schemas.unitCreateSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.createUnit(req.user.id, req.validated.body));
}));

router.get('/units/:id', validate(schemas.idSchema), asyncHandler(async (req, res) => {
  res.json(await service.getUnit(req.user, req.validated.params.id));
}));

router.put('/units/:id', requireRole('ADMIN'), validate(schemas.unitUpdateSchema), asyncHandler(async (req, res) => {
  res.json(await service.updateUnit(req.user.id, req.validated.params.id, req.validated.body));
}));

router.delete('/units/:id', requireRole('ADMIN'), validate(schemas.idSchema), asyncHandler(async (req, res) => {
  await service.deleteUnit(req.user.id, req.validated.params.id);
  res.status(204).send();
}));

router.get('/lessons', asyncHandler(async (req, res) => {
  res.json(await service.listLessons(req.user, req.query));
}));

router.post('/lessons', requireRole('ADMIN'), validate(schemas.lessonCreateSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.createLesson(req.user.id, req.validated.body));
}));

router.get('/lessons/:id', validate(schemas.idSchema), asyncHandler(async (req, res) => {
  res.json(await service.getLesson(req.user, req.validated.params.id));
}));

router.put('/lessons/:id', requireRole('ADMIN'), validate(schemas.lessonUpdateSchema), asyncHandler(async (req, res) => {
  res.json(await service.updateLesson(req.user.id, req.validated.params.id, req.validated.body));
}));

router.delete('/lessons/:id', requireRole('ADMIN'), validate(schemas.idSchema), asyncHandler(async (req, res) => {
  await service.deleteLesson(req.user.id, req.validated.params.id);
  res.status(204).send();
}));

router.get('/lessons/:lessonId/exercises', validate(schemas.lessonIdSchema), asyncHandler(async (req, res) => {
  res.json(await service.listExercises(req.user, req.validated.params.lessonId, req.query));
}));

router.post('/lessons/:lessonId/exercises', requireRole('ADMIN'), validate(schemas.exerciseCreateSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.createExercise(req.user.id, req.validated.params.lessonId, req.validated.body));
}));

router.put('/exercises/:id', requireRole('ADMIN'), validate(schemas.exerciseUpdateSchema), asyncHandler(async (req, res) => {
  res.json(await service.updateExercise(req.user.id, req.validated.params.id, req.validated.body));
}));

router.delete('/exercises/:id', requireRole('ADMIN'), validate(schemas.idSchema), asyncHandler(async (req, res) => {
  await service.deleteExercise(req.user.id, req.validated.params.id);
  res.status(204).send();
}));

module.exports = router;
