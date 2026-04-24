const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'lms_access_token';
const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'lms_auth_user';

function emitAuthChange(eventType) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:changed', { detail: { type: eventType } }));
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => { localStorage.setItem(TOKEN_KEY, t); emitAuthChange('token:set'); };
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthChange('session:cleared');
};
export const clearToken = () => clearSession();

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (res.status === 401) {
    clearSession();
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }
  if (res.status === 403 && window.location.pathname !== '/403') {
    window.location.href = '/403';
  }
  if (!res.ok || (data && data.success === false)) throw new Error(data?.message || `HTTP ${res.status}`);
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'success')) {
    return data.data ?? null;
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b, auth = true) => request(p, { method: 'POST', body: b, auth }),
  put: (p, b) => request(p, { method: 'PUT', body: b }),
  del: (p) => request(p, { method: 'DELETE' }),
};
