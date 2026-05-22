import React, { useState } from 'react';
import { Bell, BookOpen, ShieldCheck, Trophy, Users } from 'lucide-react';
import { api, saveSession } from '../lib/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'parent@literacy.kz', password: 'Parent12345!' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const session = await api(endpoint, { method: 'POST', body });
      saveSession(session);
      onAuth(session);
    } catch (err) {
      setError(err.message);
    }
  }

  function fill(email, password) {
    setMode('login');
    setForm((prev) => ({ ...prev, email, password }));
  }

  return (
    <div className="auth-layout desktop-auth">
      <section className="hero-card wide-hero">
        <div className="badge-soft"><BookOpen size={18} /> Smart Kids Learning Platform</div>
        <h1>Детская платформа для чтения</h1>
        <p>Родитель добавляет ребенка, запускает уроки, видит прогресс, баллы, уведомления и время занятий.</p>
        <div className="feature-grid">
          <span><ShieldCheck /> Secure login</span>
          <span><Trophy /> XP и награды</span>
          <span><Bell /> Уведомления</span>
          <span><Users /> Родительский контроль</span>
        </div>
      </section>

      <form className="login-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Login' : 'Create parent account'}</h2>
        {mode === 'register' && (
          <label>Имя
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Parent name" />
          </label>
        )}
        <label>Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password" />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary">{mode === 'login' ? 'Login' : 'Create account'}</button>
        <button type="button" className="secondary" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create parent account' : 'Back to login'}
        </button>
        <div className="login-shortcuts">
          <button type="button" onClick={() => fill('parent@literacy.kz', 'Parent12345!')}>Parent demo</button>
          <button type="button" onClick={() => fill('admin@literacy.kz', 'Admin12345!')}>Admin demo</button>
        </div>
      </form>
    </div>
  );
}
