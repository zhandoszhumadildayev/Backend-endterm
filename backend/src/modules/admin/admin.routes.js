const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, requireRole } = require('../../middlewares/auth');
const service = require('./admin.service');

const router = express.Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/logs', asyncHandler(async (req, res) => {
  res.json(await service.listLogs(req.query));
}));

router.get('/stats', asyncHandler(async (_req, res) => {
  res.json(await service.stats());
}));

module.exports = router;
