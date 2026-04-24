import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppShell({ children }) {
  const { role, switchRole, availableRoles } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/courses/course-1/submissions', label: 'Teacher Dashboard', roles: ['teacher', 'admin'] },
    { to: '/courses/course-1/lessons/lesson-1/submissions', label: 'Lesson Submissions', roles: ['student', 'teacher', 'admin'] },
    { to: '/courses/course-1/lessons/lesson-1/submissions/create', label: 'Create Submission', roles: ['student', 'admin'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-xl font-semibold">LMS Assignment Module</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Role</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              value={role}
              onChange={(event) => switchRole(event.target.value)}
            >
              {availableRoles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 pb-4">
          {navLinks
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  location.pathname === item.to
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
