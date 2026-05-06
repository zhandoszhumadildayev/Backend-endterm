const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');
const service = require('./notifications.service');
const { markReadSchema } = require('./notifications.schemas');

const router = express.Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await service.listNotifications(req.user, req.query));
}));

router.patch('/:id', validate(markReadSchema), asyncHandler(async (req, res) => {
  res.json(await service.markNotification(req.user, req.validated.params.id, req.validated.body.read));
}));

module.exports = router;
