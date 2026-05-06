import React from 'react';
import { BookOpen, Check, Gift, Headphones, Lock, Pencil, Play, Puzzle, Star } from 'lucide-react';

const icons = { PHONICS: Headphones, HANDWRITING: Pencil, SIGHT_WORDS: Star, VOCABULARY: BookOpen, QUIZ: Puzzle };

export default function LessonNode({ lesson, index, status, onClick }) {
  const firstType = lesson.exercises?.[0]?.type || 'VOCABULARY';
  const Icon = status === 'locked' ? Lock : status === 'completed' ? Check : icons[firstType] || BookOpen;
  const side = index % 2 === 0 ? 'left' : 'right';

  return (
    <div className={`lesson-row ${side}`}>
      <button type="button" className={`lesson-node ${status}`} onClick={() => onClick(lesson, status)} title={lesson.titleText}>
        {lesson.reward ? <Gift /> : <Icon />}
        {status === 'current' && <span className="pulse-ring" />}
        {status === 'completed' && <span className="shine" />}
      </button>
      <div className="lesson-label">
        <strong>{index + 1}. {lesson.titleText}</strong>
        <span>{status === 'completed' ? 'Выполнено' : status === 'current' ? 'Текущий урок' : 'Закрыто'} · {lesson.xpReward || 10} XP</span>
      </div>
    </div>
  );
}
