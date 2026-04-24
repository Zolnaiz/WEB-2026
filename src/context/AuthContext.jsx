import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiClient, clearStoredToken, getStoredToken, setStoredToken } from '../services/apiClient';

const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'lms_auth_user';

const AuthContext = createContext(null);

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function parseJwtPayload(token) {
  if (!token || !token.includes('.')) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const login = async (credentials) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await apiClient.login(credentials);
      const accessToken = response?.access_token || response?.token || response?.data?.token;
      if (!accessToken) {
        throw new Error('Login succeeded but token was not returned by API.');
      }

      const resolvedUser =
        response?.user ||
        response?.data?.user ||
        parseJwtPayload(accessToken) ||
        { id: credentials.username || credentials.email || 'unknown-user', role: 'student' };

      setStoredToken(accessToken);
      setStoredUser(resolvedUser);
      setToken(accessToken);
      setUser(resolvedUser);
      return resolvedUser;
    } catch (error) {
      setAuthError(error.message || 'Unable to login.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setStoredUser(null);
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'student';

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      login,
      logout,
      authLoading,
      authError,
      isAuthenticated: Boolean(token),
    }),
    [token, user, role, authLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
