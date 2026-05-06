const cron = require('node-cron');
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { sendDailyStreakReminders } = require('./modules/notifications/notifications.service');

const server = app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  console.log(`Swagger UI: http://localhost:${env.port}/api/docs`);
});

cron.schedule('0 18 * * *', async () => {
  try {
    const result = await sendDailyStreakReminders();
    console.log(`Daily streak reminder job created ${result.created} notifications`);
  } catch (err) {
    console.error('Daily streak reminder job failed', err.message);
  }
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
