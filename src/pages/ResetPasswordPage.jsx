import React, { useState } from 'react';
import { api } from '../services/apiClient';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password }, false);
      setMessage('Password reset successful.');
    } catch (err) {
      setError(err.message);
    }
  };

  return <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-3 rounded border bg-white p-4"><h1 className="text-lg font-semibold">Reset password</h1>{error && <div className="text-sm text-red-600">{error}</div>}{message && <div className="text-sm text-green-700">{message}</div>}<input className="w-full rounded border px-3 py-2" required value={token} onChange={(e)=>setToken(e.target.value)} placeholder="reset token"/><input className="w-full rounded border px-3 py-2" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="new password"/><button className="rounded bg-indigo-600 px-3 py-2 text-white">Reset</button></form>;
}
