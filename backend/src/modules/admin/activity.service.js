const prisma = require('../../config/prisma');

async function logAdminAction(adminId, action, entity, entityId, before, after) {
  if (!adminId) return null;
  return prisma.activityLog.create({
    data: { adminId, action, entity, entityId, before, after }
  });
}

module.exports = { logAdminAction };
