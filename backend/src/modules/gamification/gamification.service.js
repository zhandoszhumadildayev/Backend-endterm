const prisma = require('../../config/prisma');
const { isSameDay, isYesterday } = require('../../utils/date');

const XP_PER_LEVEL = 100;

function calculateLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function calculateScore(correct, timeTakenSeconds) {
  if (!correct) return 0;
  if (timeTakenSeconds <= 10) return 100;
  if (timeTakenSeconds <= 30) return 80;
  return 60;
}

function nextStreak(lastActiveDate, currentStreak, now = new Date()) {
  if (isSameDay(lastActiveDate, now)) return currentStreak;
  if (isYesterday(lastActiveDate, now)) return currentStreak + 1;
  return 1;
}

async function awardBadge(childId, code) {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return null;
  return prisma.childBadge.upsert({
    where: { childId_badgeId: { childId, badgeId: badge.id } },
    update: {},
    create: { childId, badgeId: badge.id },
    include: { badge: true }
  });
}

async function evaluateBadges(child) {
  const awarded = [];

  const completedCount = await prisma.lessonProgress.count({ where: { childId: child.id } });
  if (completedCount >= 1) awarded.push(await awardBadge(child.id, 'FIRST_LESSON'));
  if (child.streak >= 7) awarded.push(await awardBadge(child.id, 'SEVEN_DAY_STREAK'));
  if (child.xp >= 100) awarded.push(await awardBadge(child.id, 'HUNDRED_XP'));

  const completedLessonIds = await prisma.lessonProgress.findMany({ where: { childId: child.id }, select: { lessonId: true } });
  const completedIds = new Set(completedLessonIds.map((item) => item.lessonId));
  const units = await prisma.unit.findMany({ where: { published: true }, include: { lessons: { where: { published: true }, select: { id: true } } } });
  const hasCompletedUnit = units.some((unit) => unit.lessons.length > 0 && unit.lessons.every((lesson) => completedIds.has(lesson.id)));
  if (hasCompletedUnit) awarded.push(await awardBadge(child.id, 'UNIT_COMPLETE'));

  return awarded.filter(Boolean);
}

async function updateProgressPercentage(childId) {
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { published: true } }),
    prisma.lessonProgress.count({ where: { childId } })
  ]);
  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  await prisma.child.update({ where: { id: childId }, data: { progressPercentage } });
  return progressPercentage;
}

module.exports = { XP_PER_LEVEL, calculateLevel, calculateScore, nextStreak, awardBadge, evaluateBadges, updateProgressPercentage };
