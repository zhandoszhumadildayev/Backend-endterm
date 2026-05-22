import React from 'react';
import { BookOpen, LogOut, ShieldCheck } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function TopBar({ session, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><BookOpen size={22} /></div>
        <div>
          <strong>Smart Kids Platform</strong>
          <span>Интерактивная обучающая платформа для детей</span>
        </div>
      </div>

      <div className="top-actions">
        {session.user.role === 'ADMIN' && (
          <a href={API_URL.replace('/api/v1', '/api/docs')} target="_blank" rel="noreferrer">API Docs</a>
        )}
        <span className="role-pill"><ShieldCheck size={15} /> {session.user.role}</span>
        <button className="ghost small" onClick={onLogout}><LogOut size={16} /> Logout</button>
      </div>
    </header>
  );
}
