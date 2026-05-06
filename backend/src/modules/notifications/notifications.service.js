const prisma = require('../../config/prisma');
const { getPagination, pageResponse } = require('../../utils/pagination');
const { forbidden, notFound } = require('../../utils/httpError');
const { startOfDay } = require('../../utils/date');

async function listNotifications(user, query) {
  const { page, pageSize, skip, take } = getPagination(query);
  const where = user.role === 'ADMIN' ? {} : { parentId: user.id };
  if (query.read === 'true') where.read = true;
  if (query.read === 'false') where.read = false;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { child: true } }),
    prisma.notification.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function markNotification(user, notificationId, read) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw notFound('Notification not found');
  if (user.role !== 'ADMIN' && notification.parentId !== user.id) throw forbidden('You can only update your notifications');
  return prisma.notification.update({ where: { id: notificationId }, data: { read } });
}

async function sendDailyStreakReminders() {
  const today = startOfDay(new Date());
  const children = await prisma.child.findMany({ include: { parent: true } });
  let created = 0;
  for (const child of children) {
    if (!child.lastActiveDate || startOfDay(child.lastActiveDate).getTime() < today.getTime()) {
      const exists = await prisma.notification.findFirst({
        where: {
          parentId: child.parentId,
          childId: child.id,
          type: 'STREAK_REMINDER',
          createdAt: { gte: today }
        }
      });
      if (!exists) {
        await prisma.notification.create({
          data: {
            parentId: child.parentId,
            childId: child.id,
            type: 'STREAK_REMINDER',
            title: 'Streak reminder',
            message: `${child.displayName} has not practiced today. Complete one lesson to keep the streak active.`
          }
        });
        created += 1;
      }
    }
  }
  return { created };
}

module.exports = { listNotifications, markNotification, sendDailyStreakReminders };
