const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const { conflict, unauthorized } = require('../../utils/httpError');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, addDays } = require('../../utils/tokens');

const sanitizeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: addDays(7)
    }
  });
  return { accessToken, refreshToken };
}

async function registerParent({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('Email is already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'PARENT' } });
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized('Invalid email or password');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid email or password');

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw unauthorized('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const saved = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true }
  });

  if (!saved) throw unauthorized('Refresh token is revoked or expired');

  await prisma.refreshToken.update({ where: { id: saved.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(saved.user);
  return { user: sanitizeUser(saved.user), ...tokens };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

module.exports = { registerParent, login, refresh, logout, sanitizeUser };
