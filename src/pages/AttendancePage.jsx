import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function AttendancePage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [record, setRecord] = useState({ userId: 'u-student', courseId: 'c-1', date: new Date().toISOString().slice(0, 10), type: 'present' });
  const [leaveForm, setLeaveForm] = useState({ reason: '', date: new Date().toISOString().slice(0, 10), courseId: 'c-1' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [attendanceRes, leaveRes] = await Promise.all([api.get('/attendance'), api.get('/leave-requests')]);
      setAttendance(attendanceRes.items || []);
      setLeaves(leaveRes.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const mark = async (event) => {
    event.preventDefault();
    try {
      await api.post('/attendance', record);
      pushToast('Attendance marked', 'success');
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const requestLeave = async (event) => {
    event.preventDefault();
    try {
      await api.post('/leave-requests', leaveForm);
      pushToast('Leave requested', 'success');
      setLeaveForm({ ...leaveForm, reason: '' });
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const approve = async (id, status) => {
    try {
      await api.post(`/leave-requests/${id}/approve`, { status });
      pushToast('Leave updated', 'success');
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Attendance & Leave</h2>
      {loading && <p className="text-sm text-slate-500">Loading attendance...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {['teacher', 'admin'].includes(role) && (
        <form onSubmit={mark} className="flex flex-wrap gap-2 rounded border bg-white p-3">
          <input className="rounded border px-2 py-1" placeholder="userId" value={record.userId} onChange={(e) => setRecord({ ...record, userId: e.target.value })} required />
          <input className="rounded border px-2 py-1" placeholder="courseId" value={record.courseId} onChange={(e) => setRecord({ ...record, courseId: e.target.value })} required />
          <input type="date" className="rounded border px-2 py-1" value={record.date} onChange={(e) => setRecord({ ...record, date: e.target.value })} required />
          <select className="rounded border px-2 py-1" value={record.type} onChange={(e) => setRecord({ ...record, type: e.target.value })}>
            <option>present</option>
            <option>absent</option>
            <option>leave</option>
          </select>
          <button className="rounded bg-indigo-600 px-2 text-white">Track</button>
        </form>
      )}

      {role === 'student' && (
        <form className="flex flex-wrap gap-2 rounded border bg-white p-3" onSubmit={requestLeave}>
          <input className="rounded border px-2 py-1" placeholder="courseId" value={leaveForm.courseId} onChange={(e) => setLeaveForm({ ...leaveForm, courseId: e.target.value })} required />
          <input className="rounded border px-2 py-1" type="date" value={leaveForm.date} onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })} required />
          <input className="min-w-72 flex-1 rounded border px-2 py-1" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Leave reason" required />
          <button className="rounded bg-emerald-600 px-2 text-white">Request Leave</button>
        </form>
      )}

      <div className="rounded border bg-white p-3">
        <h3 className="font-semibold">Attendance records</h3>
        {attendance.length === 0 ? <p className="text-sm text-slate-500">No records.</p> : attendance.map((item) => <div key={item.id} className="border-b py-1 text-sm">{item.date} - {item.userId} - {item.type}</div>)}
      </div>

      <div className="rounded border bg-white p-3">
        <h3 className="font-semibold">Leave requests</h3>
        {leaves.length === 0 ? <p className="text-sm text-slate-500">No leave requests.</p> : leaves.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-1 text-sm">
            <span>{item.userId} - {item.courseId} - {item.reason} - {item.status}</span>
            {['teacher', 'admin'].includes(role) && (
              <span className="space-x-2">
                <button className="text-green-700" onClick={() => approve(item.id, 'approved')}>Approve</button>
                <button className="text-red-700" onClick={() => approve(item.id, 'rejected')}>Reject</button>
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
