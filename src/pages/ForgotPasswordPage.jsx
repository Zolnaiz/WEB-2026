import React, { useState } from 'react';
import { api } from '../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email }, false);
      setMessage(`Reset token (demo): ${res.token || 'N/A'}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-3 rounded border bg-white p-4"><h1 className="text-lg font-semibold">Forgot password</h1>{error && <div className="text-sm text-red-600">{error}</div>}{message && <div className="text-sm text-green-700">{message}</div>}<input className="w-full rounded border px-3 py-2" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email"/><button className="rounded bg-indigo-600 px-3 py-2 text-white">Send reset</button></form>;
}
