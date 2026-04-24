import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function ExamsPage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const canManage = ['teacher', 'admin', 'schooladmin'].includes(role);

  const [exams, setExams] = useState([]);
  const [variants, setVariants] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [createExamForm, setCreateExamForm] = useState({ courseId: '', title: '', durationMinutes: 30 });
  const [createVariantForm, setCreateVariantForm] = useState({ examId: '', title: '' });
  const [createQuestionForm, setCreateQuestionForm] = useState({ variantId: '', text: '', optionsText: '', correctAnswer: '' });

  const load = async () => {
    const [courseRes, examRes, variantRes] = await Promise.all([api.get('/courses'), api.get('/exams'), api.get('/exam-variants')]);
    setCourses(courseRes.items || []);
    setExams(examRes.items || []);
    setVariants(variantRes.items || []);
  };
  useEffect(() => { load().catch((e) => pushToast(e.message, 'error')); }, []);

  const variantsByExam = useMemo(() => variants.reduce((acc, item) => ({ ...acc, [item.examId]: [...(acc[item.examId] || []), item] }), {}), [variants]);

  const createExam = async (e) => {
    e.preventDefault();
    if (!createExamForm.courseId || !createExamForm.title.trim()) return pushToast('courseId and title are required', 'error');
    const res = await api.post('/exams', { ...createExamForm, durationMinutes: Number(createExamForm.durationMinutes) || 30 });
    setCreateVariantForm((prev) => ({ ...prev, examId: res.item.id }));
    setCreateExamForm((prev) => ({ ...prev, title: '' }));
    await load();
  };

  const createVariant = async (e) => {
    e.preventDefault();
    if (!createVariantForm.examId || !createVariantForm.title.trim()) return pushToast('examId and title are required', 'error');
    const res = await api.post('/exam-variants', createVariantForm);
    setCreateQuestionForm((prev) => ({ ...prev, variantId: res.item.id }));
    setCreateVariantForm((prev) => ({ ...prev, title: '' }));
    await load();
  };

  const createQuestion = async (e) => {
    e.preventDefault();
    const options = createQuestionForm.optionsText.split(',').map((v) => v.trim()).filter(Boolean);
    if (!createQuestionForm.variantId || !createQuestionForm.text.trim() || options.length < 2 || !createQuestionForm.correctAnswer.trim()) {
      return pushToast('variantId, text, options(2+), correctAnswer are required', 'error');
    }
    await api.post('/exam-questions', { variantId: createQuestionForm.variantId, text: createQuestionForm.text, options, correctAnswer: createQuestionForm.correctAnswer });
    setCreateQuestionForm((prev) => ({ ...prev, text: '' }));
    await load();
  };

  const start = async (examId) => {
    if (!examId) return;
    const started = await api.post(`/exams/${examId}/start`, {});
    const q = await api.get(`/exam-attempts/${started.item.id}/questions`);
    setAttempt(started.item);
    setAttemptQuestions(q.items || []);
    setAnswers({});
  };

  return (
    <section className="space-y-4"><h2 className="text-xl font-semibold">Exams</h2>
      {canManage && <div className="grid gap-3 md:grid-cols-3">
        <form className="rounded border bg-white p-3 space-y-2" onSubmit={(e) => createExam(e).catch((er) => pushToast(er.message, 'error'))}><h3 className="font-semibold">Create Exam</h3><select className="w-full rounded border px-2 py-1" value={createExamForm.courseId} onChange={(e) => setCreateExamForm({ ...createExamForm, courseId: e.target.value })} required><option value="">Select course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select><input className="w-full rounded border px-2 py-1" placeholder="title" value={createExamForm.title} onChange={(e) => setCreateExamForm({ ...createExamForm, title: e.target.value })} required /><button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button></form>
        <form className="rounded border bg-white p-3 space-y-2" onSubmit={(e) => createVariant(e).catch((er) => pushToast(er.message, 'error'))}><h3 className="font-semibold">Create Variant</h3><select className="w-full rounded border px-2 py-1" value={createVariantForm.examId} onChange={(e) => setCreateVariantForm({ ...createVariantForm, examId: e.target.value })} required><option value="">Select exam</option>{exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}</select><input className="w-full rounded border px-2 py-1" placeholder="title" value={createVariantForm.title} onChange={(e) => setCreateVariantForm({ ...createVariantForm, title: e.target.value })} required /><button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button></form>
        <form className="rounded border bg-white p-3 space-y-2" onSubmit={(e) => createQuestion(e).catch((er) => pushToast(er.message, 'error'))}><h3 className="font-semibold">Create Question</h3><select className="w-full rounded border px-2 py-1" value={createQuestionForm.variantId} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, variantId: e.target.value })} required><option value="">Select variant</option>{variants.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}</select><input className="w-full rounded border px-2 py-1" placeholder="question text" value={createQuestionForm.text} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, text: e.target.value })} required /><input className="w-full rounded border px-2 py-1" placeholder="options comma-separated" value={createQuestionForm.optionsText} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, optionsText: e.target.value })} required /><input className="w-full rounded border px-2 py-1" placeholder="correct answer" value={createQuestionForm.correctAnswer} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, correctAnswer: e.target.value })} required /><button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button></form>
      </div>}

      {exams.map((exam) => <div className="rounded border bg-white p-3" key={exam.id}><div className="font-medium">{exam.title}</div><div className="text-xs text-slate-600">Course: {exam.courseId} | Variants: {(variantsByExam[exam.id] || []).map((v) => v.title).join(', ') || 'none'}</div>{role === 'student' && <button className="mt-2 rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => start(exam.id).catch((er) => pushToast(er.message, 'error'))}>Start Exam</button>}</div>)}

      {attempt && <div className="rounded border bg-white p-3"><h3 className="font-semibold">Attempt {attempt.id}</h3>{attemptQuestions.map((q) => <div key={q.id}><div className="text-sm">{q.text}</div><select className="rounded border px-2 py-1 text-sm" value={answers[q.id] || ''} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}><option value="">Select answer</option>{q.options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>)}{attempt.status === 'started' && <div className="space-x-2 mt-2"><button className="rounded bg-slate-600 px-3 py-1 text-white" onClick={() => api.post(`/exam-attempts/${attempt.id}/answers`, { answers }).then(() => pushToast('Saved', 'success')).catch((e) => pushToast(e.message, 'error'))}>Save</button><button className="rounded bg-indigo-600 px-3 py-1 text-white" onClick={() => api.post(`/exam-attempts/${attempt.id}/finish`, {}).then((done) => api.get(`/exam-attempts/${done.item.id}/result`)).then((r) => { setAttempt(r.item); pushToast(`Score: ${r.item.score}`, 'success'); }).catch((e) => pushToast(e.message, 'error'))}>Finish</button></div>}</div>}
    </section>
  );
}
