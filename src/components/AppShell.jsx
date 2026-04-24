import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/users', label: 'Users', roles: ['admin', 'schooladmin'] },
  { to: '/roles', label: 'Roles', roles: ['admin', 'schooladmin'] },
  { to: '/school', label: 'School', roles: ['admin', 'schooladmin'] },
  { to: '/courses', label: 'Courses', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/lessons', label: 'Lessons', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/submissions', label: 'Submissions', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/exams', label: 'Exams', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/attendance', label: 'Attendance', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/groups', label: 'Groups', roles: ['admin', 'schooladmin', 'teacher'] },
  { to: '/grade', label: 'Grade', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/profile', label: 'Profile', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/profile/change-password', label: 'Change Password', roles: ['admin', 'schooladmin', 'teacher', 'student'] },
  { to: '/question-types', label: 'Question Types', roles: ['admin', 'schooladmin', 'teacher'] },
  { to: '/question-levels', label: 'Question Levels', roles: ['admin', 'schooladmin', 'teacher'] },
];

export default function AppShell({ children }) {
  const { role, logout } = useAuth();
  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl justify-between px-4 py-3">
          <div className="font-semibold">LMS</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="capitalize">{role}</span>
            <button className="rounded border px-3 py-1" onClick={logout}>Logout</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-2">
          {allowedNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rounded px-3 py-1 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
