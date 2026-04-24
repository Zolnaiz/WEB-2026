import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppShell({ children }) {
  const { role, logout } = useAuth();
  const nav = [
    ['/', 'Dashboard'], ['/users', 'Users'], ['/courses', 'Courses'], ['/lessons', 'Lessons'], ['/submissions', 'Submissions'], ['/exams', 'Exams'], ['/attendance', 'Attendance'], ['/groups', 'Groups'],
  ];
  const navigate = useNavigate();
  return <div className="min-h-screen bg-slate-100"><header className="bg-white border-b"><div className="max-w-6xl mx-auto px-4 py-3 flex justify-between"><div className="font-semibold">LMS</div><div className="flex items-center gap-3 text-sm"><span>{role}</span><button className="px-3 py-1 border rounded" onClick={()=>{logout();navigate('/login');}}>Logout</button></div></div><nav className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap gap-2">{nav.map(([to,label])=><Link className="px-3 py-1 bg-slate-200 rounded text-sm" key={to} to={to}>{label}</Link>)}</nav></header><main className="max-w-6xl mx-auto p-4">{children}</main></div>;
}
