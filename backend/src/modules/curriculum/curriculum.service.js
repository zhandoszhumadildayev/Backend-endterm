const prisma = require('../../config/prisma');
const { getPagination, pageResponse } = require('../../utils/pagination');
const { notFound } = require('../../utils/httpError');
const { logAdminAction } = require('../admin/activity.service');

function boolFilter(value) {
  if (value === undefined) return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

async function listUnits(user, query) {
  const { page, pageSize, skip, take } = getPagination(query);
  const where = {};
  const published = boolFilter(query.published);
  if (published !== undefined) where.published = published;
  if (query.difficulty) where.difficulty = String(query.difficulty).toUpperCase();
  if (user.role !== 'ADMIN') where.published = true;

  const [items, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      skip,
      take,
      orderBy: { orderNo: 'asc' },
      include: { _count: { select: { lessons: true } } }
    }),
    prisma.unit.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function createUnit(adminId, data) {
  const created = await prisma.unit.create({ data });
  await logAdminAction(adminId, 'CREATE', 'Unit', created.id, null, created);
  return created;
}

async function getUnit(user, id) {
  const where = user.role === 'ADMIN' ? { id } : { id, published: true };
  const unit = await prisma.unit.findFirst({
    where,
    include: { lessons: { where: user.role === 'ADMIN' ? {} : { published: true }, orderBy: { orderNo: 'asc' } } }
  });
  if (!unit) throw notFound('Unit not found');
  return unit;
}

async function updateUnit(adminId, id, data) {
  const before = await prisma.unit.findUnique({ where: { id } });
  if (!before) throw notFound('Unit not found');
  const updated = await prisma.unit.update({ where: { id }, data });
  await logAdminAction(adminId, 'UPDATE', 'Unit', id, before, updated);
  return updated;
}

async function deleteUnit(adminId, id) {
  const before = await prisma.unit.findUnique({ where: { id } });
  if (!before) throw notFound('Unit not found');
  await prisma.unit.delete({ where: { id } });
  await logAdminAction(adminId, 'DELETE', 'Unit', id, before, null);
}

async function listLessons(user, query) {
  const { page, pageSize, skip, take } = getPagination(query);
  const where = {};
  if (query.unitId) where.unitId = query.unitId;
  if (query.difficulty) where.difficulty = String(query.difficulty).toUpperCase();
  const published = boolFilter(query.published);
  if (published !== undefined) where.published = published;
  if (user.role !== 'ADMIN') where.published = true;

  const sortBy = ['orderNo', 'createdAt', 'xpReward'].includes(query.sortBy) ? query.sortBy : 'orderNo';
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  const [items, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { unit: true, _count: { select: { exercises: true } } }
    }),
    prisma.lesson.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function createLesson(adminId, data) {
  const created = await prisma.lesson.create({ data });
  await logAdminAction(adminId, 'CREATE', 'Lesson', created.id, null, created);
  return created;
}

async function getLesson(user, id) {
  const where = user.role === 'ADMIN' ? { id } : { id, published: true };
  const lesson = await prisma.lesson.findFirst({ where, include: { unit: true, exercises: { orderBy: { orderNo: 'asc' } } } });
  if (!lesson) throw notFound('Lesson not found');
  return lesson;
}

async function updateLesson(adminId, id, data) {
  const before = await prisma.lesson.findUnique({ where: { id } });
  if (!before) throw notFound('Lesson not found');
  const updated = await prisma.lesson.update({ where: { id }, data });
  await logAdminAction(adminId, 'UPDATE', 'Lesson', id, before, updated);
  return updated;
}

async function deleteLesson(adminId, id) {
  const before = await prisma.lesson.findUnique({ where: { id } });
  if (!before) throw notFound('Lesson not found');
  await prisma.lesson.delete({ where: { id } });
  await logAdminAction(adminId, 'DELETE', 'Lesson', id, before, null);
}

async function listExercises(user, lessonId, query) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || (user.role !== 'ADMIN' && !lesson.published)) throw notFound('Lesson not found');
  const { page, pageSize, skip, take } = getPagination(query || {});
  const where = { lessonId };
  if (query.type) where.type = String(query.type).toUpperCase();
  if (query.difficulty) where.difficulty = String(query.difficulty).toUpperCase();
  const [items, total] = await Promise.all([
    prisma.exercise.findMany({ where, skip, take, orderBy: { orderNo: 'asc' } }),
    prisma.exercise.count({ where })
  ]);
  return pageResponse(items, total, page, pageSize);
}

async function createExercise(adminId, lessonId, data) {
  const created = await prisma.exercise.create({ data: { ...data, lessonId } });
  await logAdminAction(adminId, 'CREATE', 'Exercise', created.id, null, created);
  return created;
}

async function updateExercise(adminId, id, data) {
  const before = await prisma.exercise.findUnique({ where: { id } });
  if (!before) throw notFound('Exercise not found');
  const updated = await prisma.exercise.update({ where: { id }, data });
  await logAdminAction(adminId, 'UPDATE', 'Exercise', id, before, updated);
  return updated;
}

async function deleteExercise(adminId, id) {
  const before = await prisma.exercise.findUnique({ where: { id } });
  if (!before) throw notFound('Exercise not found');
  await prisma.exercise.delete({ where: { id } });
  await logAdminAction(adminId, 'DELETE', 'Exercise', id, before, null);
}

module.exports = { listUnits, createUnit, getUnit, updateUnit, deleteUnit, listLessons, createLesson, getLesson, updateLesson, deleteLesson, listExercises, createExercise, updateExercise, deleteExercise };
