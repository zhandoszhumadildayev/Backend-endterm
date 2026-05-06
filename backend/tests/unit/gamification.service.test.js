const { calculateLevel, calculateScore, nextStreak } = require('../../src/modules/gamification/gamification.service');

describe('gamification service pure logic', () => {
  test('calculateLevel returns a new level every 100 XP', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(250)).toBe(3);
  });

  test('calculateScore rewards correct and fast answers', () => {
    expect(calculateScore(false, 5)).toBe(0);
    expect(calculateScore(true, 5)).toBe(100);
    expect(calculateScore(true, 20)).toBe(80);
    expect(calculateScore(true, 40)).toBe(60);
  });

  test('nextStreak keeps same day, increments yesterday and resets old dates', () => {
    const today = new Date('2026-05-04T12:00:00Z');
    expect(nextStreak(new Date('2026-05-04T05:00:00Z'), 3, today)).toBe(3);
    expect(nextStreak(new Date('2026-05-03T12:00:00Z'), 3, today)).toBe(4);
    expect(nextStreak(new Date('2026-05-01T12:00:00Z'), 3, today)).toBe(1);
    expect(nextStreak(null, 0, today)).toBe(1);
  });
});
