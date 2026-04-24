import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function AttendancePage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [record, setRecord] = useState({ userId: 'u-student', courseId: 'c-1', date: new Date().toISOString().slice(0, 10), type: 'present' });
  const [leaveReason, setLeaveReason] = useState('');

  const load = async () => {
    const [a, l] = await Promise.all([api.get('/attendance'), api.get('/leave-requests')]);
    setAttendance(a.items || []); setLeaves(l.items || []);
  };
  useEffect(() => { load(); }, []);

  const mark = async (e) => { e.preventDefault(); await api.post('/attendance', record); pushToast('Attendance marked', 'success'); load(); };
  const requestLeave = async (e) => { e.preventDefault(); await api.post('/leave-requests', { reason: leaveReason, date: record.date }); pushToast('Leave requested', 'success'); setLeaveReason(''); load(); };
  const approve = async (id, status) => { await api.post(`/leave-requests/${id}/approve`, { status }); pushToast('Leave updated', 'success'); load(); };

  return <section className="space-y-3"><h2 className="text-xl font-semibold">Attendance & Leave</h2>{['teacher','admin'].includes(role)&&<form onSubmit={mark} className="bg-white border p-3 rounded flex flex-wrap gap-2"><input className="border rounded px-2 py-1" placeholder="userId" value={record.userId} onChange={(e)=>setRecord({...record,userId:e.target.value})}/><input className="border rounded px-2 py-1" placeholder="courseId" value={record.courseId} onChange={(e)=>setRecord({...record,courseId:e.target.value})}/><input type="date" className="border rounded px-2 py-1" value={record.date} onChange={(e)=>setRecord({...record,date:e.target.value})}/><select className="border rounded px-2 py-1" value={record.type} onChange={(e)=>setRecord({...record,type:e.target.value})}><option>present</option><option>absent</option><option>leave</option></select><button className="bg-indigo-600 text-white rounded px-2">Track</button></form>}{role==='student'&&<form className="bg-white border p-3 rounded flex gap-2" onSubmit={requestLeave}><input className="border rounded px-2 py-1 flex-1" value={leaveReason} onChange={(e)=>setLeaveReason(e.target.value)} placeholder="Leave reason" required/><button className="bg-emerald-600 text-white rounded px-2">Request Leave</button></form>}<div className="bg-white border rounded p-3"><h3 className="font-semibold">Attendance records</h3>{attendance.length===0?<p className="text-sm text-slate-500">No records.</p>:attendance.map((a)=><div key={a.id} className="text-sm border-b py-1">{a.date} - {a.userId} - {a.type}</div>)}</div><div className="bg-white border rounded p-3"><h3 className="font-semibold">Leave requests</h3>{leaves.length===0?<p className="text-sm text-slate-500">No leave requests.</p>:leaves.map((l)=><div key={l.id} className="text-sm border-b py-1 flex justify-between"> <span>{l.userId} - {l.reason} - {l.status}</span>{['teacher','admin'].includes(role)&&<span className="space-x-2"><button className="text-green-700" onClick={()=>approve(l.id,'approved')}>Approve</button><button className="text-red-700" onClick={()=>approve(l.id,'rejected')}>Reject</button></span>}</div>)}</div></section>;
}
