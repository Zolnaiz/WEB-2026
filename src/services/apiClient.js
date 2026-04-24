const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'lms_access_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

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
  const data = text ? JSON.parse(text) : null;
  if (res.status === 401) {
    clearToken();
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
