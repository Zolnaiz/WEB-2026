import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('student@lms.com');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); navigate('/'); } catch (err) { setError(err.message); }
  };

  return <div className="min-h-screen grid place-items-center bg-slate-100"><form onSubmit={submit} className="bg-white border rounded p-6 w-full max-w-sm space-y-3"><h1 className="text-xl font-semibold">Login</h1>{error&&<div className="text-sm text-red-600">{error}</div>}<input className="w-full border rounded px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" required /><input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" required /><button disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2">{loading?'Loading...':'Login'}</button><Link className="text-sm text-indigo-600" to="/register">Register</Link></form></div>;
}
