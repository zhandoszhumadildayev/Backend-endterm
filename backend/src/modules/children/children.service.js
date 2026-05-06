const prisma = require('../../config/prisma');
const { getPagination, pageResponse } = require('../../utils/pagination');
const { forbidden, notFound } = require('../../utils/httpError');

async function ensureChildAccess(user, childId) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw notFound('Child not found');
  if (user.role !== 'ADMIN' && child.parentId !== user.id) {
    throw forbidden('You can access only your linked child profiles');
  }
  return child;
}

async function listChildren(user, query) {
  const { page, pageSize, skip, take } = getPagination(query);
  const where = user.role === 'ADMIN' ? {} : { parentId: user.id };
  const [items, total] = await Promise.all([
    prisma.child.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { badges: { include: { badge: true } }, _count: { select: { lessonProgress: true } } }
    }),
    prisma.child.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function createChild(parentId, data) {
  return prisma.child.create({
    data: { ...data, parentId },
    include: { badges: { include: { badge: true } } }
  });
}

async function getChild(user, childId) {
  await ensureChildAccess(user, childId);
  return prisma.child.findUnique({
    where: { id: childId },
    include: {
      parent: { select: { id: true, email: true, name: true } },
      badges: { include: { badge: true } },
      _count: { select: { exerciseResults: true, lessonProgress: true } }
    }
  });
}

async function updateChild(user, childId, data) {
  await ensureChildAccess(user, childId);
  return prisma.child.update({ where: { id: childId }, data });
}

async function deleteChild(user, childId) {
  await ensureChildAccess(user, childId);
  await prisma.child.delete({ where: { id: childId } });
}

async function getProgress(user, childId, query) {
  await ensureChildAccess(user, childId);
  const { page, pageSize, skip, take } = getPagination(query || {});
  const [child, completed, results, totalResults] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.lessonProgress.findMany({
      where: { childId },
      orderBy: { completedAt: 'desc' },
      include: { lesson: { include: { unit: true } } }
    }),
    prisma.exerciseResult.findMany({
      where: { childId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { exercise: { include: { lesson: true } } }
    }),
    prisma.exerciseResult.count({ where: { childId } })
  ]);

  return {
    child,
    completedLessons: completed,
    exerciseResults: pageResponse(results, totalResults, page, pageSize)
  };
}

async function getBadges(user, childId) {
  await ensureChildAccess(user, childId);
  return prisma.childBadge.findMany({
    where: { childId },
    orderBy: { awardedAt: 'desc' },
    include: { badge: true }
  });
}

module.exports = { ensureChildAccess, listChildren, createChild, getChild, updateChild, deleteChild, getProgress, getBadges };
