import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) return setError('Email is required');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email }, false);
      setMessage(res?.resetToken ? `Reset token: ${res.resetToken}` : 'If account exists, reset token has been created.');
    } catch (err) {
      setError(`${err.message} (status: ${err.status ?? 'n/a'}, endpoint: ${err.endpoint ?? '/auth/forgot-password'})`);
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen grid place-items-center bg-slate-100"><form onSubmit={submit} className="space-y-3 rounded border bg-white p-6 w-full max-w-sm"><h1 className="text-xl font-semibold">Forgot Password</h1>{error && <p className="text-sm text-red-600">{error}</p>}{message && <p className="text-sm text-emerald-700">{message}</p>}<input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><button disabled={loading} className="w-full rounded bg-indigo-600 py-2 text-white disabled:opacity-60">{loading ? 'Sending...' : 'Send reset token'}</button><Link className="text-sm text-indigo-600" to="/reset-password">Go to reset</Link></form></div>;
}
