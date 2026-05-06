const prisma = require('../config/prisma');
const { verifyAccessToken } = require('../utils/tokens');
const { unauthorized, forbidden } = require('../utils/httpError');

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return next(unauthorized('Missing bearer token'));

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true, role: true } });
    if (!user) return next(unauthorized('User no longer exists'));
    req.user = user;
    next();
  } catch (_err) {
    next(unauthorized('Invalid or expired token'));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('You do not have permission for this action'));
    next();
  };
}

module.exports = { authenticate, requireRole };
