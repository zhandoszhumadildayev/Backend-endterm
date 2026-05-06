const express = require('express');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/auth');
const { getPagination, pageResponse } = require('../../utils/pagination');

const router = express.Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = getPagination(req.query);
  const where = {};
  if (req.query.minAge || req.query.maxAge) {
    where.age = {};
    if (req.query.minAge) where.age.gte = Number(req.query.minAge);
    if (req.query.maxAge) where.age.lte = Number(req.query.maxAge);
  }

  const [items, total] = await Promise.all([
    prisma.child.findMany({
      where,
      skip,
      take,
      orderBy: [{ xp: 'desc' }, { streak: 'desc' }],
      select: { id: true, displayName: true, age: true, xp: true, level: true, streak: true, progressPercentage: true }
    }),
    prisma.child.count({ where })
  ]);

  res.json(pageResponse(items.map((item, index) => ({ rank: skip + index + 1, ...item })), total, page, pageSize));
}));

module.exports = router;
