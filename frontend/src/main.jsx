import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { clearSession, getSession } from './lib/api';
import TopBar from './components/TopBar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './styles.css';

function App() {
  const [session, setSession] = useState(getSession());

  function logout() {
    clearSession();
    setSession(null);
  }

  if (!session) return <AuthPage onAuth={setSession} />;

  return (
    <>
      <TopBar session={session} onLogout={logout} />
      {session.user.role === 'ADMIN' ? <AdminDashboard /> : <ParentDashboard />}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
