const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'lms_access_token';
const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'lms_auth_user';

const PUBLIC_AUTH_ROUTES = new Set(['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']);

function emitAuthChange(eventType) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { type: eventType } }));
  }
}

export class ApiError extends Error {
  constructor({ message, status, endpoint, method, data }) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.method = method;
    this.data = data;
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  emitAuthChange('token:set');
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitAuthChange('session:cleared');
};

export const clearToken = () => clearSession();

class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const endpoint = `${API_BASE_URL}${path}`;
  const token = getToken();
  const endpoint = `${API_BASE_URL}${path}`;

  const res = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  const data = payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success')
    ? payload.data
    : payload;
  const message = payload?.message || (res.ok ? 'OK' : `HTTP ${res.status}`);

  if (res.status === 401 && !PUBLIC_AUTH_ROUTES.has(path)) {
    clearSession();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (res.status === 501 && import.meta.env.DEV) {
    console.warn(`[API 501] ${method} ${path}`);
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError({ message, status: res.status, endpoint: path, method, data });
  }

  return data ?? null;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, auth = true) => request(path, { method: 'POST', body, auth }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export const getApiBaseUrl = () => API_BASE_URL;
