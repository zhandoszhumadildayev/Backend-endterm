import React, { useEffect, useMemo, useState } from 'react';
import { Award, Bell, BookOpen, Clock, Flame, Gem, Heart, Plus, Trash2, Trophy, Users } from 'lucide-react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard.jsx';
import GuideCharacter from '../components/GuideCharacter.jsx';
import LessonNode from '../components/LessonNode.jsx';
import LessonStartModal from '../components/LessonStartModal.jsx';

function text(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.ru || value.en || value.kk || Object.values(value)[0] || fallback;
}

function formatTime(seconds = 0) {
  const s = Math.max(0, Number(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин ${sec} сек`;
  return `${sec} сек`;
}

function normalizeLesson(lesson, index) {
  return {
    ...lesson,
    titleText: text(lesson.title, `Урок ${index + 1}`),
    instructionText: text(lesson.instructions, 'Выбери правильный ответ')
  };
}

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [newChild, setNewChild] = useState({ displayName: 'Аян', age: 7 });
  const [message, setMessage] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [onlineSeconds, setOnlineSeconds] = useState(0);

  const selectedChild = useMemo(() => children.find((child) => child.id === selectedChildId) || children[0], [children, selectedChildId]);

  const completedLessonIds = useMemo(() => new Set((progress?.completedLessons || []).map((item) => item.lessonId)), [progress]);
  const currentIndex = useMemo(() => lessons.findIndex((lesson) => !completedLessonIds.has(lesson.id)), [lessons, completedLessonIds]);
  const studySeconds = useMemo(() => {
    const results = progress?.exerciseResults?.items || [];
    return results.reduce((sum, item) => sum + Number(item.timeTakenSeconds || 0), 0);
  }, [progress]);

  async function loadBase() {
    const [childRes, lessonRes, notifRes, leaderRes] = await Promise.all([
      api('/children?page_size=100'),
      api('/lessons?page_size=100'),
      api('/notifications?page_size=30'),
      api('/leaderboard?page_size=10')
    ]);

    const lessonItems = lessonRes.items || [];
    const lessonsWithExercises = await Promise.all(
      lessonItems.map(async (lesson, index) => {
        try {
          const exerciseRes = await api(`/lessons/${lesson.id}/exercises?page_size=20`);
          return normalizeLesson({ ...lesson, exercises: exerciseRes.items || [] }, index);
        } catch {
          return normalizeLesson({ ...lesson, exercises: [] }, index);
        }
      })
    );

    const childItems = childRes.items || [];
    setChildren(childItems);
    setLessons(lessonsWithExercises);
    setNotifications(notifRes.items || []);
    setLeaderboard(leaderRes.items || []);

    if (!selectedChildId && childItems[0]) setSelectedChildId(childItems[0].id);
  }

  async function loadProgress(childId = selectedChild?.id) {
    if (!childId) {
      setProgress(null);
      return;
    }
    const progressRes = await api(`/children/${childId}/progress?page_size=100`);
    setProgress(progressRes);
  }

  async function refreshAll() {
    await loadBase();
    if (selectedChild?.id) await loadProgress(selectedChild.id);
  }

  useEffect(() => {
    loadBase().catch((err) => setMessage(err.message));
  }, []);

  useEffect(() => {
    if (selectedChild?.id) {
      loadProgress(selectedChild.id).catch((err) => setMessage(err.message));
      const saved = Number(localStorage.getItem(`online_seconds_${selectedChild.id}`) || 0);
      setOnlineSeconds(saved);
    }
  }, [selectedChild?.id]);

  useEffect(() => {
    if (!selectedChild?.id) return undefined;
    const id = setInterval(() => {
      setOnlineSeconds((prev) => {
        const next = prev + 1;
        localStorage.setItem(`online_seconds_${selectedChild.id}`, String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [selectedChild?.id]);

  async function createChild(e) {
    e.preventDefault();
    setMessage('');
    try {
      const created = await api('/children', {
        method: 'POST',
        body: { displayName: newChild.displayName, age: Number(newChild.age) }
      });
      setSelectedChildId(created.id);
      setNewChild({ displayName: '', age: 7 });
      setMessage('Ребенок добавлен. Теперь можно проходить уроки.');
      await loadBase();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function deleteChild(child) {
    if (!window.confirm(`Удалить профиль ребенка ${child.displayName}?`)) return;
    setMessage('');
    try {
      await api(`/children/${child.id}`, { method: 'DELETE' });
      localStorage.removeItem(`online_seconds_${child.id}`);
      setSelectedChildId('');
      setProgress(null);
      setMessage('Профиль ребенка удален.');
      await loadBase();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function statusForLesson(lesson, index) {
    if (completedLessonIds.has(lesson.id)) return 'completed';
    if (index === currentIndex || currentIndex === -1) return 'current';
    return 'locked';
  }

  async function openLesson(lesson, status) {
    if (!selectedChild) {
      setMessage('Сначала добавьте ребенка.');
      return;
    }

    if (status === 'locked') {
      setMessage('Этот урок закрыт. Сначала выполните предыдущий урок.');
      return;
    }

    if (status === 'completed') {
      setMessage('Этот урок уже выполнен. Выберите следующий урок.');
      return;
    }

    try {
      setMessage('Загружаем задания урока...');

      const exerciseRes = await api(`/lessons/${lesson.id}/exercises?page_size=20`);
      const exercises = exerciseRes.items || [];

      if (exercises.length === 0) {
        setMessage('В этом уроке пока нет заданий. Проверьте seed или Admin panel.');
        return;
      }

      setMessage('');

      setActiveLesson(
          normalizeLesson(
              {
                ...lesson,
                exercises
              },
              lesson.orderNo ? lesson.orderNo - 1 : 0
          )
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function afterLessonFinished() {
    await refreshAll();
    setMessage('Урок сохранен: баллы, прогресс и уведомления обновлены.');
  }

  return (
    <main className="desktop-dashboard">
      <section className="left-panel panel">
        <div className="section-title">
          <div>
            <h2>Родительский кабинет</h2>
            <p>Все действия ребенка выполняются из аккаунта родителя.</p>
          </div>
        </div>

        <form className="child-form" onSubmit={createChild}>
          <h3>Добавить ребенка</h3>
          <input value={newChild.displayName} onChange={(e) => setNewChild({ ...newChild, displayName: e.target.value })} placeholder="Имя ребенка" />
          <input type="number" min="3" max="12" value={newChild.age} onChange={(e) => setNewChild({ ...newChild, age: e.target.value })} placeholder="Возраст" />
          <button className="primary"><Plus size={16} /> Добавить</button>
        </form>

        <div className="child-list">
          <h3>Дети</h3>
          {children.length === 0 && <p className="muted">Пока нет детей. Добавьте ребенка.</p>}
          {children.map((child) => (
            <div key={child.id} className={`child-card ${selectedChild?.id === child.id ? 'active' : ''}`}>
              <button type="button" onClick={() => setSelectedChildId(child.id)}>
                <strong>{child.displayName}</strong>
                <span>{child.age} лет · {child.xp} XP · streak {child.streak}</span>
              </button>
              <button className="icon-danger" type="button" onClick={() => deleteChild(child)}><Trash2 size={17} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="center-panel">
        <div className="stats-row desktop-stats">
          <StatCard title="XP" value={selectedChild?.xp || 0} icon={<Gem />} hint="баллы" />
          <StatCard title="Streak" value={selectedChild?.streak || 0} icon={<Flame />} hint="дней" />
          <StatCard title="Уроки" value={`${completedLessonIds.size}/${lessons.length}`} icon={<Trophy />} hint="прогресс" />
          <StatCard title="Время" value={formatTime(onlineSeconds)} icon={<Clock />} hint="в кабинете" />
        </div>

        {message && <div className="notice">{message}</div>}

        <div className="lesson-board panel">
          <div className="module-card">
            <div>
              <span>Модуль 1 · Русский язык 7–8 лет</span>
              <h2>Чтение, буквы и слова</h2>
              <p>Проходите уроки по очереди. После каждого урока родитель получает уведомление.</p>
            </div>
            <GuideCharacter />
          </div>

          <div className="lesson-map desktop-map">
            {lessons.map((lesson, index) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={index}
                status={statusForLesson(lesson, index)}
                onClick={openLesson}
              />
            ))}
            {lessons.length === 0 && <div className="empty-lessons">Уроки не найдены. Запустите updated seed.</div>}
            {lessons.length > 0 && <div className="reward-chest">🎁 Большой сундук после всех уроков</div>}
          </div>
        </div>
      </section>

      <aside className="right-panel panel">
        <h3>Информация для родителя</h3>
        <div className="info-grid">
          <div><Users size={18} /><span>Ребенок</span><strong>{selectedChild?.displayName || 'Не выбран'}</strong></div>
          <div><BookOpen size={18} /><span>Выполнено уроков</span><strong>{completedLessonIds.size}</strong></div>
          <div><Award size={18} /><span>Всего заданий</span><strong>{progress?.exerciseResults?.total || 0}</strong></div>
          <div><Clock size={18} /><span>Время заданий</span><strong>{formatTime(studySeconds)}</strong></div>
        </div>

        <h3>Уведомления</h3>
        <div className="notification-list">
          {notifications.length === 0 && <p className="muted">Уведомлений пока нет.</p>}
          {notifications.map((notification) => (
            <div className={`notification ${notification.read ? '' : 'unread'}`} key={notification.id}>
              <Bell size={16} />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>

        <h3>Leaderboard</h3>
        <div className="leader-list">
          {leaderboard.map((item, index) => (
            <div key={item.id || index} className="leader-item">
              <span>#{index + 1}</span>
              <strong>{item.displayName}</strong>
              <em>{item.xp} XP</em>
            </div>
          ))}
        </div>
      </aside>

      {activeLesson && selectedChild && (
        <LessonStartModal
          child={selectedChild}
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onFinished={afterLessonFinished}
        />
      )}
    </main>
  );
}
