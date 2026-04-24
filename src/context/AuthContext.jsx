import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../services/apiClient';

const AuthContext = createContext(null);
const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'lms_auth_user';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me').then((r) => setUser(r.user)).catch(() => logout());
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const r = await api.post('/auth/login', { email, password }, false);
      setToken(r.token);
      localStorage.setItem(USER_KEY, JSON.stringify(r.user));
      setTokenState(r.token);
      setUser(r.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const r = await api.post('/auth/register', payload, false);
      setToken(r.token);
      localStorage.setItem(USER_KEY, JSON.stringify(r.user));
      setTokenState(r.token);
      setUser(r.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, role: user?.role, loading, login, register, logout, isAuthenticated: !!token }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used in AuthProvider');
  return ctx;
};
