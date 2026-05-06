const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimit');
const service = require('./auth.service');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.schemas');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const result = await service.registerParent(req.validated.body);
  res.status(201).json(result);
}));

router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const result = await service.login(req.validated.body);
  res.json(result);
}));

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
  const result = await service.refresh(req.validated.body.refreshToken);
  res.json(result);
}));

router.post('/logout', asyncHandler(async (req, res) => {
  await service.logout(req.body.refreshToken);
  res.status(204).send();
}));

module.exports = router;
