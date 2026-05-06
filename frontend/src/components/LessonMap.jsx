import React from 'react';
import { Flame, Gem, Heart, NotebookTabs, Sparkles } from 'lucide-react';
import GuideCharacter from './GuideCharacter.jsx';
import LessonNode from './LessonNode.jsx';

function getText(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.en || value.ru || value.kz || Object.values(value)[0] || fallback;
}

function buildNodes(lessons, child) {
  const realLessons = lessons.length > 0 ? lessons : [
    { id: 'mock-1', title: { en: 'Letter A sounds' }, xpReward: 10 },
    { id: 'mock-2', title: { en: 'Letter B sounds' }, xpReward: 15 },
    { id: 'mock-3', title: { en: 'Listen and choose' }, xpReward: 15 },
    { id: 'mock-4', title: { en: 'Word practice' }, xpReward: 20 },
    { id: 'mock-5', title: { en: 'Reading challenge' }, xpReward: 25 }
  ];

  const total = realLessons.length;
  const progress = Math.max(0, Math.min(100, Number(child?.progressPercentage || 0)));
  const completedCount = total > 0 ? Math.min(Math.floor((progress / 100) * total), total) : 0;
  const currentIndex = Math.min(completedCount, total - 1);

  const icons = ['book', 'listen', 'star', 'book', 'listen', 'trophy'];
  const nodes = realLessons.map((lesson, index) => ({
    ...lesson,
    kind: 'lesson',
    title: getText(lesson.title, `Lesson ${index + 1}`),
    icon: icons[index % icons.length],
    status: index < completedCount ? 'completed' : index === currentIndex ? 'current' : 'locked'
  }));

  nodes.push({
    id: 'reward-chest',
    kind: 'reward',
    title: 'Reward chest',
    icon: 'reward',
    status: completedCount >= total && total > 0 ? 'current' : 'locked'
  });

  return nodes;
}

export default function LessonMap({ child, lessons, onNodeClick }) {
  const nodes = buildNodes(lessons, child);

  return (
    <section className="lesson-phone">
      <div className="phone-status">
        <span>📚 10</span>
        <span><Flame /> {child?.streak || 0}</span>
        <span><Gem /> {child?.xp || 0}</span>
        <span><Heart /> ∞</span>
      </div>

      <div className="module-card">
        <div>
          <span>Module 1 · Section 1</span>
          <h2>Learn letters and sounds</h2>
        </div>
        <NotebookTabs />
      </div>

      <div className="map-area">
        <div className="sparkle sparkle-a"><Sparkles /></div>
        <div className="sparkle sparkle-b"><Sparkles /></div>

        {nodes.map((node, index) => (
          <LessonNode key={node.id} node={node} index={index} onClick={onNodeClick} />
        ))}

        <div className="guide-position"><GuideCharacter /></div>
      </div>

      <nav className="bottom-nav">
        <button className="active">🏠</button>
        <button>🔊</button>
        <button>🎁</button>
        <button>🏆</button>
        <button>💬</button>
      </nav>
    </section>
  );
}
