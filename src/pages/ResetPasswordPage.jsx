import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!token.trim()) return setError('Token is required');
    if (password.length < 3) return setError('Password length must be at least 3');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password }, false);
      navigate('/login');
    } catch (err) {
      setError(`${err.message} (status: ${err.status ?? 'n/a'}, endpoint: ${err.endpoint ?? '/auth/reset-password'})`);
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen grid place-items-center bg-slate-100"><form onSubmit={submit} className="space-y-3 rounded border bg-white p-6 w-full max-w-sm"><h1 className="text-xl font-semibold">Reset Password</h1>{error && <p className="text-sm text-red-600">{error}</p>}<input className="w-full rounded border px-3 py-2" placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} required /><input type="password" className="w-full rounded border px-3 py-2" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button disabled={loading} className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-60">{loading ? 'Saving...' : 'Reset password'}</button><Link className="text-sm text-indigo-600" to="/forgot-password">Forgot password</Link></form></div>;
}
