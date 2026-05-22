const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');

jest.setTimeout(30000);

async function resetDb() {
  await prisma.notification.deleteMany();
  await prisma.childBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.exerciseResult.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.child.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();
}

describe('core API flow', () => {
  let parentToken;
  let adminToken;
  let childId;
  let lessonId;
  let exerciseId;

  beforeAll(async () => {
    await resetDb();
    await prisma.badge.createMany({ data: [
      { code: 'FIRST_LESSON', name: 'First Lesson', description: 'First completed lesson' },
      { code: 'HUNDRED_XP', name: '100 XP', description: 'Earn 100 XP' },
      { code: 'SEVEN_DAY_STREAK', name: '7-Day Streak', description: 'Seven days' },
      { code: 'UNIT_COMPLETE', name: 'Unit Complete', description: 'Complete a unit' }
    ] });
    await prisma.user.create({ data: { name: 'Admin', email: 'admin@test.kz', role: 'ADMIN', passwordHash: await bcrypt.hash('Admin12345!', 12) } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('parent registers and creates child', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({ name: 'Parent', email: 'parent@test.kz', password: 'Parent12345!' });
    expect(register.status).toBe(201);
    parentToken = register.body.accessToken;

    const child = await request(app).post('/api/v1/children').set('Authorization', `Bearer ${parentToken}`).send({ displayName: 'Dana', age: 7 });
    expect(child.status).toBe(201);
    expect(child.body.displayName).toBe('Dana');
    childId = child.body.id;
  });

  test('admin creates curriculum', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.kz', password: 'Admin12345!' });
    expect(login.status).toBe(200);
    adminToken = login.body.accessToken;

    const unit = await request(app).post('/api/v1/units').set('Authorization', `Bearer ${adminToken}`).send({ title: { en: 'Phonics 1' }, orderNo: 1, published: true });
    expect(unit.status).toBe(201);

    const lesson = await request(app).post('/api/v1/lessons').set('Authorization', `Bearer ${adminToken}`).send({ unitId: unit.body.id, title: { en: 'Letter A' }, orderNo: 1, xpReward: 20, published: true });
    expect(lesson.status).toBe(201);
    lessonId = lesson.body.id;

    const exercise = await request(app).post(`/api/v1/lessons/${lessonId}/exercises`).set('Authorization', `Bearer ${adminToken}`).send({ type: 'PHONICS', prompt: { en: 'Pick A' }, options: ['A', 'B'], correctAnswer: 'A', orderNo: 1 });
    expect(exercise.status).toBe(201);
    exerciseId = exercise.body.id;
  });

  test('child submits exercise and completes lesson', async () => {
    const submit = await request(app).post(`/api/v1/exercises/${exerciseId}/submit`).set('Authorization', `Bearer ${parentToken}`).send({ childId, answer: 'A', timeTakenSeconds: 8 });
    expect(submit.status).toBe(201);
    expect(submit.body.correct).toBe(true);

    const complete = await request(app).post(`/api/v1/lessons/${lessonId}/complete`).set('Authorization', `Bearer ${parentToken}`).send({ childId });
    expect(complete.status).toBe(201);
    expect(complete.body.child.xp).toBe(20);
    expect(complete.body.badges.length).toBeGreaterThanOrEqual(1);
  });

  test('parent can retrieve progress and notifications', async () => {
    const progress = await request(app).get(`/api/v1/children/${childId}/progress`).set('Authorization', `Bearer ${parentToken}`);
    expect(progress.status).toBe(200);
    expect(progress.body.completedLessons.length).toBe(1);

    const notifications = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${parentToken}`);
    expect(notifications.status).toBe(200);
    expect(notifications.body.total).toBeGreaterThanOrEqual(1);
  });
});
