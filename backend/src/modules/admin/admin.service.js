const prisma = require('../../config/prisma');
const { getPagination, pageResponse } = require('../../utils/pagination');

async function listLogs(query) {
  const { page, pageSize, skip, take } = getPagination(query);
  const where = {};
  if (query.entity) where.entity = query.entity;
  if (query.action) where.action = query.action;
  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { admin: { select: { id: true, email: true, name: true } } } }),
    prisma.activityLog.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function stats() {
  const [parents, children, units, lessons, exercises, completedLessons, notifications, avgProgress] = await Promise.all([
    prisma.user.count({ where: { role: 'PARENT' } }),
    prisma.child.count(),
    prisma.unit.count(),
    prisma.lesson.count(),
    prisma.exercise.count(),
    prisma.lessonProgress.count(),
    prisma.notification.count({ where: { read: false } }),
    prisma.child.aggregate({ _avg: { progressPercentage: true, xp: true } })
  ]);

  return {
    parents,
    children,
    units,
    lessons,
    exercises,
    completedLessons,
    unreadNotifications: notifications,
    averageProgressPercentage: Math.round(avgProgress._avg.progressPercentage || 0),
    averageXp: Math.round(avgProgress._avg.xp || 0)
  };
}

module.exports = { listLogs, stats };
