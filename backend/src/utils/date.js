function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isYesterday(date, now = new Date()) {
  if (!date) return false;
  const yesterday = startOfDay(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(date).getTime() === yesterday.getTime();
}

module.exports = { startOfDay, isSameDay, isYesterday };
