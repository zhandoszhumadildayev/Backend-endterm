const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function getSession() {
  const raw = localStorage.getItem('literacy_session');
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(session) {
  localStorage.setItem('literacy_session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('literacy_session');
}

export async function api(path, options = {}) {
  const session = getSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(options.headers || {})
    },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.details = data.details;
    throw error;
  }
  return data;
}

export { API_URL };
