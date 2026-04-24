import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function ExamsPage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const canManage = ['teacher', 'admin'].includes(role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exams, setExams] = useState([]);
  const [variants, setVariants] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [attempt, setAttempt] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [createExamForm, setCreateExamForm] = useState({ courseId: 'c-1', title: '', durationMinutes: 30 });
  const [createVariantForm, setCreateVariantForm] = useState({ examId: 'e-1', title: '' });
  const [createQuestionForm, setCreateQuestionForm] = useState({ variantId: 'v-1', text: '', optionsText: 'A,B', correctAnswer: 'A' });

  const variantsByExam = useMemo(() => variants.reduce((acc, item) => {
    acc[item.examId] = acc[item.examId] || [];
    acc[item.examId].push(item);
    return acc;
  }, {}), [variants]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [examRes, variantRes, questionRes] = await Promise.all([
        api.get('/exams'),
        api.get('/exam-variants'),
        api.get('/exam-questions'),
      ]);
      setExams(examRes.items || []);
      setVariants(variantRes.items || []);
      setQuestions(questionRes.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createExam = async (event) => {
    event.preventDefault();
    try {
      await api.post('/exams', { ...createExamForm, durationMinutes: Number(createExamForm.durationMinutes) || 30 });
      pushToast('Exam created', 'success');
      setCreateExamForm((prev) => ({ ...prev, title: '' }));
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const createVariant = async (event) => {
    event.preventDefault();
    try {
      await api.post('/exam-variants', createVariantForm);
      pushToast('Variant created', 'success');
      setCreateVariantForm((prev) => ({ ...prev, title: '' }));
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const createQuestion = async (event) => {
    event.preventDefault();
    try {
      const options = createQuestionForm.optionsText.split(',').map((item) => item.trim()).filter(Boolean);
      await api.post('/exam-questions', {
        variantId: createQuestionForm.variantId,
        text: createQuestionForm.text,
        options,
        correctAnswer: createQuestionForm.correctAnswer,
      });
      pushToast('Question created', 'success');
      setCreateQuestionForm((prev) => ({ ...prev, text: '' }));
      await load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const start = async (examId) => {
    try {
      const started = await api.post(`/exams/${examId}/start`, {});
      setAttempt(started.item);
      const q = await api.get(`/exam-attempts/${started.item.id}/questions`);
      setAttemptQuestions(q.items || []);
      setAnswers({});
      pushToast('Exam started', 'success');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const saveAnswers = async () => {
    if (!attempt) return;
    try {
      await api.post(`/exam-attempts/${attempt.id}/answers`, { answers });
      pushToast('Answers saved', 'success');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const finish = async () => {
    if (!attempt) return;
    try {
      await api.post(`/exam-attempts/${attempt.id}/answers`, { answers });
      const done = await api.post(`/exam-attempts/${attempt.id}/finish`, {});
      const result = await api.get(`/exam-attempts/${done.item.id}/result`);
      pushToast(`Exam finished. Score: ${result.item.score}`, 'success');
      setAttempt(result.item);
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Exams</h2>

      {loading && <p className="text-sm text-slate-500">Loading exams...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && canManage && (
        <div className="grid gap-3 md:grid-cols-3">
          <form className="rounded border bg-white p-3 space-y-2" onSubmit={createExam}>
            <h3 className="font-semibold">Create Exam</h3>
            <input className="w-full rounded border px-2 py-1" placeholder="courseId" value={createExamForm.courseId} onChange={(e) => setCreateExamForm({ ...createExamForm, courseId: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" placeholder="title" value={createExamForm.title} onChange={(e) => setCreateExamForm({ ...createExamForm, title: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" type="number" min="1" placeholder="durationMinutes" value={createExamForm.durationMinutes} onChange={(e) => setCreateExamForm({ ...createExamForm, durationMinutes: e.target.value })} />
            <button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button>
          </form>

          <form className="rounded border bg-white p-3 space-y-2" onSubmit={createVariant}>
            <h3 className="font-semibold">Create Variant</h3>
            <input className="w-full rounded border px-2 py-1" placeholder="examId" value={createVariantForm.examId} onChange={(e) => setCreateVariantForm({ ...createVariantForm, examId: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" placeholder="title" value={createVariantForm.title} onChange={(e) => setCreateVariantForm({ ...createVariantForm, title: e.target.value })} required />
            <button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button>
          </form>

          <form className="rounded border bg-white p-3 space-y-2" onSubmit={createQuestion}>
            <h3 className="font-semibold">Create Question</h3>
            <input className="w-full rounded border px-2 py-1" placeholder="variantId" value={createQuestionForm.variantId} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, variantId: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" placeholder="question text" value={createQuestionForm.text} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, text: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" placeholder="options comma-separated" value={createQuestionForm.optionsText} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, optionsText: e.target.value })} required />
            <input className="w-full rounded border px-2 py-1" placeholder="correct answer" value={createQuestionForm.correctAnswer} onChange={(e) => setCreateQuestionForm({ ...createQuestionForm, correctAnswer: e.target.value })} required />
            <button className="rounded bg-indigo-600 px-3 py-1 text-white">Create</button>
          </form>
        </div>
      )}

      {!loading && !error && exams.length === 0 && <p className="text-sm text-slate-500">No exams available.</p>}

      {!loading && !error && exams.length > 0 && (
        <div className="space-y-2">
          {exams.map((exam) => (
            <div className="rounded border bg-white p-3" key={exam.id}>
              <div className="font-medium">{exam.title}</div>
              <div className="text-xs text-slate-600">Exam: {exam.id} | Course: {exam.courseId} | Duration: {exam.durationMinutes}m</div>
              <div className="text-xs text-slate-500">Variants: {(variantsByExam[exam.id] || []).map((v) => v.id).join(', ') || 'none'}</div>
              {role === 'student' && <button className="mt-2 rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => start(exam.id)}>Start Exam</button>}
            </div>
          ))}
        </div>
      )}

      {attempt && (
        <div className="rounded border bg-white p-3">
          <h3 className="font-semibold">Attempt {attempt.id} ({attempt.status})</h3>
          {attemptQuestions.length === 0 ? (
            <p className="text-sm text-slate-500">No questions available for this attempt.</p>
          ) : (
            <div className="space-y-2">
              {attemptQuestions.map((question) => (
                <div key={question.id}>
                  <div className="text-sm">{question.text}</div>
                  <select className="rounded border px-2 py-1 text-sm" value={answers[question.id] || ''} onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}>
                    <option value="">Select answer</option>
                    {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              ))}
              {attempt.status === 'started' ? (
                <div className="space-x-2">
                  <button className="rounded bg-slate-600 px-3 py-1 text-white" onClick={saveAnswers}>Save</button>
                  <button className="rounded bg-indigo-600 px-3 py-1 text-white" onClick={finish}>Finish Exam</button>
                </div>
              ) : (
                <p className="text-sm text-emerald-700">Final score: {attempt.score}</p>
              )}
            </div>
          )}

          <div className="mt-3 text-xs text-slate-500">Question bank size: {questions.length}</div>
        </div>
      )}
    </section>
  );
}
