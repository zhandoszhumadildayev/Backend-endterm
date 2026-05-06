const prisma = require('../../config/prisma');
const { badRequest, conflict, notFound } = require('../../utils/httpError');
const { ensureChildAccess } = require('../children/children.service');
const { calculateScore, calculateLevel, nextStreak, evaluateBadges, updateProgressPercentage } = require('../gamification/gamification.service');

function lessonTitle(lesson) {
  if (!lesson?.title) return 'урок';
  return lesson.title.ru || lesson.title.en || Object.values(lesson.title)[0] || 'урок';
}

async function submitExercise(user, exerciseId, { childId, answer, timeTakenSeconds }) {
  await ensureChildAccess(user, childId);
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId }, include: { lesson: true } });
  if (!exercise || (!exercise.lesson.published && user.role !== 'ADMIN')) throw notFound('Exercise not found');

  const correct = String(answer).trim().toLowerCase() === String(exercise.correctAnswer).trim().toLowerCase();
  const score = calculateScore(correct, timeTakenSeconds);

  return prisma.exerciseResult.create({
    data: { childId, exerciseId, answer, correct, timeTakenSeconds, score },
    include: { exercise: true }
  });
}

async function completeLesson(user, lessonId, { childId }) {
  const child = await ensureChildAccess(user, childId);
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { exercises: true, unit: true } });
  if (!lesson || (!lesson.published && user.role !== 'ADMIN')) throw notFound('Lesson not found');

  const previousLesson = await prisma.lesson.findFirst({
    where: { unitId: lesson.unitId, orderNo: { lt: lesson.orderNo }, published: true },
    orderBy: { orderNo: 'desc' }
  });
  if (previousLesson) {
    const previousProgress = await prisma.lessonProgress.findUnique({ where: { childId_lessonId: { childId, lessonId: previousLesson.id } } });
    if (!previousProgress) throw badRequest('Lessons must be completed sequentially');
  }

  const alreadyCompleted = await prisma.lessonProgress.findUnique({ where: { childId_lessonId: { childId, lessonId } } });
  if (alreadyCompleted) throw conflict('Lesson already completed by this child');

  const exerciseIds = lesson.exercises.map((exercise) => exercise.id);
  let completedResults = [];
  if (exerciseIds.length > 0) {
    completedResults = await prisma.exerciseResult.findMany({ where: { childId, exerciseId: { in: exerciseIds } } });
    const completedSet = new Set(completedResults.map((result) => result.exerciseId));
    if (!exerciseIds.every((id) => completedSet.has(id))) {
      throw badRequest('All lesson exercises must be submitted before completion');
    }
  }

  const totalTime = completedResults.reduce((sum, result) => sum + Number(result.timeTakenSeconds || 0), 0);
  const correctCount = completedResults.filter((result) => result.correct).length;
  const totalScore = completedResults.reduce((sum, result) => sum + Number(result.score || 0), 0);

  const now = new Date();
  const newXp = child.xp + lesson.xpReward;
  const newStreak = nextStreak(child.lastActiveDate, child.streak, now);
  const level = calculateLevel(newXp);

  const result = await prisma.$transaction(async (tx) => {
    const progress = await tx.lessonProgress.create({ data: { childId, lessonId, xpAwarded: lesson.xpReward } });
    const updatedChild = await tx.child.update({
      where: { id: childId },
      data: { xp: newXp, level, learningLevel: `Level ${level}`, streak: newStreak, lastActiveDate: now }
    });
    await tx.notification.create({
      data: {
        parentId: child.parentId,
        childId,
        type: 'MILESTONE',
        title: 'Урок выполнен',
        message: `${child.displayName} выполнил урок «${lessonTitle(lesson)}». XP +${lesson.xpReward}, заданий: ${exerciseIds.length}, правильно: ${correctCount}/${exerciseIds.length}, баллы за задания: ${totalScore}, время: ${totalTime} сек.`
      }
    });
    return { progress, child: updatedChild, summary: { totalTime, correctCount, totalScore, exercises: exerciseIds.length } };
  });

  await updateProgressPercentage(childId);
  const badges = await evaluateBadges(result.child);
  for (const badge of badges) {
    await prisma.notification.create({
      data: {
        parentId: child.parentId,
        childId,
        type: 'MILESTONE',
        title: 'Новая награда',
        message: `${child.displayName} получил награду: ${badge.badge.name}.`
      }
    });
  }

  return { ...result, badges };
}

module.exports = { submitExercise, completeLesson };
