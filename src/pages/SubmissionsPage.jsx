import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function SubmissionsPage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ courseId: 'c-1', lessonId: 'l-1', content: '', fileUrl: '' });
  const [grade, setGrade] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => { setLoading(true); setError(''); try { const r = await api.get('/submissions'); setItems(r.items || []); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const create = async (e) => { e.preventDefault(); try { await api.post('/submissions', form); pushToast('Submission created', 'success'); setForm({ ...form, content: '', fileUrl: '' }); load(); } catch (e2) { pushToast(e2.message, 'error'); } };
  const gradeSubmit = async (id) => { try { await api.post(`/submissions/${id}/grade`, { grade: Number(grade[id]?.grade || 0), feedback: grade[id]?.feedback || '', status: grade[id]?.status || 'graded' }); pushToast('Graded', 'success'); load(); } catch (e) { pushToast(e.message, 'error'); } };

  return <section className="space-y-3"><h2 className="text-xl font-semibold">Submissions</h2>{loading&&<div>Loading...</div>}{error&&<div className="text-red-600">{error}</div>}{!loading&&items.length===0&&<div className="text-slate-500">No submissions.</div>}<div className="space-y-2">{items.map((s)=><div key={s.id} className="bg-white border rounded p-3"><div className="text-sm">{s.id} | {s.status} | {s.content || '(file only)'}</div><div className="text-xs text-slate-600">file: {s.fileUrl || '-'}</div>{['teacher','admin'].includes(role)&&<div className="mt-2 flex gap-2"><input className="border px-2 py-1 rounded" placeholder="grade" onChange={(e)=>setGrade((p)=>({...p,[s.id]:{...p[s.id],grade:e.target.value}}))}/><input className="border px-2 py-1 rounded" placeholder="feedback" onChange={(e)=>setGrade((p)=>({...p,[s.id]:{...p[s.id],feedback:e.target.value}}))}/><select className="border px-2 py-1 rounded" onChange={(e)=>setGrade((p)=>({...p,[s.id]:{...p[s.id],status:e.target.value}}))}><option value="graded">graded</option><option value="rejected">rejected</option></select><button className="bg-indigo-600 text-white px-2 rounded" onClick={()=>gradeSubmit(s.id)}>Grade</button></div>}</div>)}</div>{['student','admin'].includes(role)&&<form onSubmit={create} className="bg-white border rounded p-3 grid gap-2 md:grid-cols-2"><input required className="border rounded px-2 py-1" placeholder="courseId" value={form.courseId} onChange={(e)=>setForm({...form,courseId:e.target.value})}/><input required className="border rounded px-2 py-1" placeholder="lessonId" value={form.lessonId} onChange={(e)=>setForm({...form,lessonId:e.target.value})}/><textarea className="border rounded px-2 py-1 md:col-span-2" placeholder="content (optional if fileUrl provided)" value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})}/><input className="border rounded px-2 py-1 md:col-span-2" placeholder="fileUrl (optional if content provided)" value={form.fileUrl} onChange={(e)=>setForm({...form,fileUrl:e.target.value})}/><button className="bg-emerald-600 text-white px-3 py-1 rounded w-fit">Create Submission</button></form>}</section>;
}
