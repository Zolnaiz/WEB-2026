import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function ExamsPage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const [exams, setExams] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [create, setCreate] = useState({ courseId: 'c-1', title: '', durationMinutes: 30 });

  const load = async () => { const r = await api.get('/exams'); setExams(r.items || []); };
  useEffect(() => { load(); }, []);

  const start = async (examId) => {
    const r = await api.post(`/exams/${examId}/start`, {});
    setAttempt(r.item);
    const q = await api.get(`/exam-attempts/${r.item.id}/questions`);
    setQuestions(q.items || []);
  };

  const submit = async () => {
    const r = await api.post(`/exam-attempts/${attempt.id}/submit`, { answers });
    const rs = await api.get(`/exam-attempts/${r.item.id}/result`);
    pushToast(`Exam finished. Score ${rs.item.score}`, 'success');
  };

  const createExam = async (e) => { e.preventDefault(); await api.post('/exams', create); pushToast('Exam created', 'success'); setCreate({ ...create, title: '' }); load(); };

  return <section className="space-y-3"><h2 className="text-xl font-semibold">Exams</h2>{['teacher','admin'].includes(role)&&<form className="bg-white border rounded p-3 flex gap-2" onSubmit={createExam}><input className="border rounded px-2" placeholder="title" value={create.title} onChange={(e)=>setCreate({...create,title:e.target.value})} required/><button className="bg-indigo-600 text-white px-2 rounded">Create</button></form>}<div className="space-y-2">{exams.map((e)=><div className="bg-white border p-3 rounded" key={e.id}><div>{e.title} ({e.courseId})</div>{role==='student'&&<button className="mt-2 bg-emerald-600 text-white px-2 py-1 rounded" onClick={()=>start(e.id)}>Start Exam</button>}</div>)}</div>{attempt&&<div className="bg-white border rounded p-3"><h3 className="font-semibold">Attempt {attempt.id}</h3>{questions.map((q)=><div key={q.id} className="mt-2"><div>{q.text}</div><select className="border rounded px-2 py-1" onChange={(e)=>setAnswers((p)=>({...p,[q.id]:e.target.value}))}><option value="">Select</option>{q.options.map((o)=><option key={o} value={o}>{o}</option>)}</select></div>)}<button className="mt-3 bg-indigo-600 text-white px-3 py-1 rounded" onClick={submit}>Finish Exam</button></div>}</section>;
}
