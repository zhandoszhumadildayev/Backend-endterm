import React, { useEffect, useState } from 'react';
import { BookOpen, Trophy, Users } from 'lucide-react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard.jsx';

function text(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.ru || value.en || value.kk || fallback;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');

  const [unitForm, setUnitForm] = useState({ title: 'Русский язык 7–8 лет', description: 'Буквы, слоги, слова и короткие предложения', orderNo: 1, difficulty: 'EASY', published: true });
  const [lessonForm, setLessonForm] = useState({ unitId: '', title: 'Новый урок', instructions: 'Выбери правильный ответ', orderNo: 13, xpReward: 20, difficulty: 'EASY', published: true });
  const [exerciseForm, setExerciseForm] = useState({ lessonId: '', type: 'VOCABULARY', prompt: 'Выбери правильный ответ', options: 'кот, дом, лес', correctAnswer: 'кот', orderNo: 1, difficulty: 'EASY' });

  async function load() {
    const [statsRes, unitsRes, lessonsRes, logsRes] = await Promise.all([
      api('/admin/stats'),
      api('/units?page_size=100'),
      api('/lessons?page_size=100'),
      api('/admin/logs?page_size=20')
    ]);

    const loadedUnits = unitsRes.items || [];
    const loadedLessons = lessonsRes.items || [];
    setStats(statsRes);
    setUnits(loadedUnits);
    setLessons(loadedLessons);
    setLogs(logsRes.items || []);

    if (!lessonForm.unitId && loadedUnits[0]) setLessonForm((prev) => ({ ...prev, unitId: loadedUnits[0].id }));
    if (!exerciseForm.lessonId && loadedLessons[0]) setExerciseForm((prev) => ({ ...prev, lessonId: loadedLessons[0].id }));
  }

  useEffect(() => { load().catch((err) => setMessage(err.message)); }, []);

  async function createUnit(e) {
    e.preventDefault();
    const created = await api('/units', {
      method: 'POST',
      body: {
        title: { ru: unitForm.title, en: unitForm.title },
        description: unitForm.description ? { ru: unitForm.description, en: unitForm.description } : undefined,
        orderNo: Number(unitForm.orderNo),
        difficulty: unitForm.difficulty,
        published: unitForm.published
      }
    });
    setLessonForm((prev) => ({ ...prev, unitId: created.id }));
    setMessage('Unit создан');
    await load();
  }

  async function createLesson(e) {
    e.preventDefault();
    const unitId = lessonForm.unitId || units[0]?.id;
    if (!unitId) return setMessage('Сначала создайте Unit.');
    const created = await api('/lessons', {
      method: 'POST',
      body: {
        unitId,
        title: { ru: lessonForm.title, en: lessonForm.title },
        instructions: { ru: lessonForm.instructions, en: lessonForm.instructions },
        orderNo: Number(lessonForm.orderNo),
        xpReward: Number(lessonForm.xpReward),
        difficulty: lessonForm.difficulty,
        published: lessonForm.published
      }
    });
    setExerciseForm((prev) => ({ ...prev, lessonId: created.id }));
    setMessage('Lesson создан');
    await load();
  }

  async function createExercise(e) {
    e.preventDefault();
    const lessonId = exerciseForm.lessonId || lessons[0]?.id;
    if (!lessonId) return setMessage('Сначала создайте Lesson.');
    await api(`/lessons/${lessonId}/exercises`, {
      method: 'POST',
      body: {
        type: exerciseForm.type,
        prompt: { ru: exerciseForm.prompt, en: exerciseForm.prompt },
        options: exerciseForm.options.split(',').map((item) => item.trim()).filter(Boolean),
        correctAnswer: exerciseForm.correctAnswer,
        orderNo: Number(exerciseForm.orderNo),
        difficulty: exerciseForm.difficulty
      }
    });
    setMessage('Exercise создан');
    await load();
  }

  return (
    <main className="admin-page">
      <section className="panel admin-head">
        <h2>Admin Dashboard</h2>
        <p>Здесь админ добавляет модули, уроки и задания. Родитель потом проходит эти уроки с ребенком.</p>
        {stats && (
          <div className="stats-row">
            <StatCard title="Parents" value={stats.parents} icon={<Users />} />
            <StatCard title="Children" value={stats.children} icon={<Users />} />
            <StatCard title="Lessons" value={stats.lessons} icon={<BookOpen />} />
            <StatCard title="Avg XP" value={stats.averageXp} icon={<Trophy />} />
          </div>
        )}
        {message && <div className="notice">{message}</div>}
      </section>

      <section className="admin-grid">
        <form className="panel mini-form" onSubmit={createUnit}>
          <h3>1. Create unit</h3>
          <input value={unitForm.title} onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })} placeholder="Unit title" />
          <input value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="Description" />
          <input type="number" value={unitForm.orderNo} onChange={(e) => setUnitForm({ ...unitForm, orderNo: e.target.value })} placeholder="Order" />
          <select value={unitForm.difficulty} onChange={(e) => setUnitForm({ ...unitForm, difficulty: e.target.value })}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select>
          <label className="check-row"><input type="checkbox" checked={unitForm.published} onChange={(e) => setUnitForm({ ...unitForm, published: e.target.checked })} /> Published</label>
          <button className="primary">Add unit</button>
        </form>

        <form className="panel mini-form" onSubmit={createLesson}>
          <h3>2. Create lesson</h3>
          <select value={lessonForm.unitId} onChange={(e) => setLessonForm({ ...lessonForm, unitId: e.target.value })}><option value="">Select unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{text(unit.title)}</option>)}</select>
          <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" />
          <input value={lessonForm.instructions} onChange={(e) => setLessonForm({ ...lessonForm, instructions: e.target.value })} placeholder="Instructions" />
          <input type="number" value={lessonForm.orderNo} onChange={(e) => setLessonForm({ ...lessonForm, orderNo: e.target.value })} placeholder="Order" />
          <input type="number" value={lessonForm.xpReward} onChange={(e) => setLessonForm({ ...lessonForm, xpReward: e.target.value })} placeholder="XP reward" />
          <label className="check-row"><input type="checkbox" checked={lessonForm.published} onChange={(e) => setLessonForm({ ...lessonForm, published: e.target.checked })} /> Published</label>
          <button className="primary">Add lesson</button>
        </form>

        <form className="panel mini-form" onSubmit={createExercise}>
          <h3>3. Create exercise</h3>
          <select value={exerciseForm.lessonId} onChange={(e) => setExerciseForm({ ...exerciseForm, lessonId: e.target.value })}><option value="">Select lesson</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{text(lesson.title)}</option>)}</select>
          <select value={exerciseForm.type} onChange={(e) => setExerciseForm({ ...exerciseForm, type: e.target.value })}><option value="PHONICS">Phonics</option><option value="HANDWRITING">Handwriting</option><option value="SIGHT_WORDS">Sight words</option><option value="VOCABULARY">Vocabulary</option></select>
          <input value={exerciseForm.prompt} onChange={(e) => setExerciseForm({ ...exerciseForm, prompt: e.target.value })} placeholder="Prompt" />
          <input value={exerciseForm.options} onChange={(e) => setExerciseForm({ ...exerciseForm, options: e.target.value })} placeholder="Options: кот, дом, лес" />
          <input value={exerciseForm.correctAnswer} onChange={(e) => setExerciseForm({ ...exerciseForm, correctAnswer: e.target.value })} placeholder="Correct answer" />
          <input type="number" value={exerciseForm.orderNo} onChange={(e) => setExerciseForm({ ...exerciseForm, orderNo: e.target.value })} placeholder="Order" />
          <button className="primary">Add exercise</button>
        </form>
      </section>

      <section className="panel curriculum-list">
        <h3>Lessons list</h3>
        <div className="lesson-table">
          {lessons.map((lesson) => <div key={lesson.id}><strong>{text(lesson.title)}</strong><span>{lesson.xpReward} XP · {lesson.published ? 'Published' : 'Draft'} · order {lesson.orderNo}</span></div>)}
        </div>
      </section>

      <section className="panel curriculum-list">
        <h3>Activity logs</h3>
        <div className="lesson-table">
          {logs.map((log) => <div key={log.id}><strong>{log.action} {log.entity}</strong><span>{new Date(log.createdAt).toLocaleString()}</span></div>)}
        </div>
      </section>
    </main>
  );
}
