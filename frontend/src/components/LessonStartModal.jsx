import React, { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { api } from '../lib/api';

function text(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.ru || value.en || value.kk || Object.values(value)[0] || fallback;
}

export default function LessonStartModal({ child, lesson, onClose, onFinished }) {
  const exercises = useMemo(() => lesson?.exercises || [], [lesson]);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState(null);
  const [answers, setAnswers] = useState([]);

  const stepStartRef = useRef(Date.now());

  const current = exercises[step];

  const progress = exercises.length
      ? Math.round(((step + (done ? 1 : 0)) / exercises.length) * 100)
      : 0;

  async function saveLesson(finalAnswers) {
    setSaving(true);

    try {
      for (const item of finalAnswers) {
        await api(`/exercises/${item.exerciseId}/submit`, {
          method: 'POST',
          body: {
            childId: child.id,
            answer: item.answer,
            timeTakenSeconds: item.timeTakenSeconds
          }
        });
      }

      const result = await api(`/lessons/${lesson.id}/complete`, {
        method: 'POST',
        body: {
          childId: child.id
        }
      });

      setSummary(result);
      setDone(true);
      setSaving(false);

      await onFinished?.();
    } catch (err) {
      setSaving(false);

      if (err.message?.toLowerCase().includes('already')) {
        setDone(true);
        setSummary({ already: true });
        await onFinished?.();
        return;
      }

      alert(err.message);
    }
  }

  function choose(option) {
    if (!current || saving || status === 'correct') return;

    setSelected(option);

    const userAnswer = String(option).trim().toLowerCase();
    const correctAnswer = String(current.correctAnswer).trim().toLowerCase();

    const correct = userAnswer === correctAnswer;

    if (!correct) {
      setStatus('wrong');

      setTimeout(() => {
        setSelected('');
        setStatus('idle');
      }, 550);

      return;
    }

    const timeTakenSeconds = Math.max(
        1,
        Math.round((Date.now() - stepStartRef.current) / 1000)
    );

    const newAnswers = [
      ...answers,
      {
        exerciseId: current.id,
        answer: option,
        timeTakenSeconds
      }
    ];

    setAnswers(newAnswers);
    setStatus('correct');

    setTimeout(() => {
      const next = step + 1;

      if (next < exercises.length) {
        setStep(next);
        setSelected('');
        setStatus('idle');
        stepStartRef.current = Date.now();
        return;
      }

      saveLesson(newAnswers);
    }, 420);
  }

  if (!lesson) return null;

  return (
      <div className="modal-backdrop">
        <div className="lesson-modal desktop-modal">
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          {!done ? (
              <>
                <div className="modal-head">
                  <div>
                    <span className="mini-badge">Урок {lesson.orderNo}</span>
                    <h2>{lesson.titleText}</h2>
                    <p>{text(lesson.instructions, 'Выбери правильный ответ')}</p>
                  </div>

                  <div className="xp-chip">+{lesson.xpReward || 10} XP</div>
                </div>

                <div className="progress-line">
                  <span style={{ width: `${progress}%` }} />
                </div>

                {current ? (
                    <div className={`task-card ${status === 'wrong' ? 'shake' : ''}`}>
                      <div className="task-top">
                        <span>Задание {step + 1} из {exercises.length}</span>
                        <span>
                    <Clock size={15} /> ответ засчитывается сразу
                  </span>
                      </div>

                      <h3>{text(current.prompt, 'Выбери ответ')}</h3>

                      <div className="answers-grid">
                        {(current.options || []).map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={[
                                  'answer-btn',
                                  selected === option ? 'selected' : '',
                                  status === 'correct' && selected === option ? 'correct' : '',
                                  status === 'wrong' && selected === option ? 'wrong' : ''
                                ].join(' ')}
                                onClick={() => choose(option)}
                            >
                              {option}
                            </button>
                        ))}
                      </div>

                      {status === 'correct' && (
                          <div className="feedback ok">
                            ✅ Правильно! Следующее задание...
                          </div>
                      )}

                      {status === 'wrong' && (
                          <div className="feedback bad">
                            Попробуй еще раз 🙂
                          </div>
                      )}

                      {saving && (
                          <div className="feedback ok">
                            ⏳ Сохраняем результат урока...
                          </div>
                      )}
                    </div>
                ) : (
                    <div className="task-card">
                      <h3>В этом уроке пока нет заданий.</h3>
                    </div>
                )}
              </>
          ) : (
              <div className="complete-card">
                <div className="confetti">✨ ⭐ ✨</div>

                <CheckCircle2 size={72} />

                <h2>Урок выполнен!</h2>

                <p>
                  {child.displayName} заработал{' '}
                  <strong>{lesson.xpReward || 10} XP</strong>.
                  Уведомление отправлено родителю.
                </p>

                <div className="complete-grid">
              <span>
                <Sparkles /> Баллы обновлены
              </span>
                  <span>
                <Sparkles /> Streak проверен
              </span>
                  <span>
                <Sparkles /> Прогресс сохранен
              </span>
                </div>

                <button className="primary" onClick={onClose}>
                  Вернуться к карте
                </button>
              </div>
          )}
        </div>
      </div>
  );
}