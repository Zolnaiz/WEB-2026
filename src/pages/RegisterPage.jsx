import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 1) return setError('Name is required');
    if (!form.email.trim()) return setError('Email is required');
    if ((form.password || '').length < 3) return setError('Password must be at least 3 characters');

    try {
      await register(form);
      navigate('/courses', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return <div className="min-h-screen grid place-items-center bg-slate-100"><form onSubmit={submit} className="bg-white border rounded p-6 w-full max-w-sm space-y-3"><h1 className="text-xl font-semibold">Register</h1>{error && <div className="text-red-600 text-sm">{error}</div>}<input required className="w-full border rounded px-3 py-2" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required className="w-full border rounded px-3 py-2" placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required type="password" className="w-full border rounded px-3 py-2" placeholder="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="w-full bg-indigo-600 text-white rounded py-2" disabled={loading}>{loading ? 'Loading...' : 'Register as student'}</button><Link className="text-sm text-indigo-600" to="/login">Login</Link></form></div>;
}
