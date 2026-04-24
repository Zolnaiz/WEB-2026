import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, authLoading, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  if (isAuthenticated) {
    return <Navigate to="/courses/course-1/lessons/lesson-1/submissions" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate('/courses/course-1/lessons/lesson-1/submissions', { replace: true });
    } catch {
      // error state is managed by auth context
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Use your LMS credentials to access submissions.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-700">Email</span>
          <input
            type="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700">Password</span>
          <input
            type="password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>

        {authError ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{authError}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {authLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
