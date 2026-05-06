const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middlewares/validate');
const { authenticate, requireRole } = require('../../middlewares/auth');
const service = require('./children.service');
const { createChildSchema, updateChildSchema, childIdSchema } = require('./children.schemas');

const router = express.Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await service.listChildren(req.user, req.query));
}));

router.post('/', requireRole('PARENT'), validate(createChildSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await service.createChild(req.user.id, req.validated.body));
}));

router.get('/:id', validate(childIdSchema), asyncHandler(async (req, res) => {
  res.json(await service.getChild(req.user, req.validated.params.id));
}));

router.put('/:id', validate(updateChildSchema), asyncHandler(async (req, res) => {
  res.json(await service.updateChild(req.user, req.validated.params.id, req.validated.body));
}));

router.delete('/:id', validate(childIdSchema), asyncHandler(async (req, res) => {
  await service.deleteChild(req.user, req.validated.params.id);
  res.status(204).send();
}));

router.get('/:id/progress', validate(childIdSchema), asyncHandler(async (req, res) => {
  res.json(await service.getProgress(req.user, req.validated.params.id, req.query));
}));

router.get('/:id/badges', validate(childIdSchema), asyncHandler(async (req, res) => {
  res.json(await service.getBadges(req.user, req.validated.params.id));
}));

module.exports = router;
