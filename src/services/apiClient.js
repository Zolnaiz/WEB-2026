const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_API_BASE;
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'lms_access_token';

class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function normalizePath(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function parseBodySafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', data, headers = {}, withAuth = true } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError('Missing API base URL environment variable (VITE_API_BASE_URL or REACT_APP_API_BASE).');
  }

  const token = withAuth ? getStoredToken() : null;
  const response = await fetch(normalizePath(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const rawText = await response.text();
  const payload = parseBodySafely(rawText);

  if (response.status === 401) {
    clearStoredToken();
    redirectToLogin();
    throw new ApiError('Unauthorized. Please login again.', { status: 401, payload });
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options) => request(path, { ...options, method: 'POST', data }),
  put: (path, data, options) => request(path, { ...options, method: 'PUT', data }),
  login: (credentials) => request('/auth/login', { method: 'POST', data: credentials, withAuth: false }),
};

export { ApiError };
