export function useAuthUser() {
  if (typeof window === 'undefined') {
    return { id: null, role: 'guest' };
  }

  const injectedUser = window.__APP_USER__;
  if (injectedUser && typeof injectedUser === 'object') {
    return injectedUser;
  }

  const raw = window.localStorage.getItem('app:user');
  if (!raw) {
    return { id: null, role: 'guest' };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { id: null, role: 'guest' };
  }
}
