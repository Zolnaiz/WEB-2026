import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function SubmissionsPage() {
  const { role } = useAuth();
  const { pushToast } = useToast();
  const canGrade = ['teacher', 'admin', 'schooladmin'].includes(role);
  const canSubmit = role === 'student';

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ courseId: '', lessonId: '', content: '', fileUrl: '' });
  const [grade, setGrade] = useState({});

  const load = async () => {
    const [subRes, courseRes, lessonRes] = await Promise.all([api.get('/submissions'), api.get('/courses'), api.get('/lessons')]);
    setItems(subRes.items || []);
    const nextCourses = courseRes.items || [];
    setCourses(nextCourses);
    setLessons(lessonRes.items || []);
    if (!form.courseId && nextCourses[0]) setForm((p) => ({ ...p, courseId: nextCourses[0].id }));
  };
  useEffect(() => { load().catch((e) => pushToast(e.message, 'error')); }, []);

  const filteredLessons = lessons.filter((lesson) => lesson.courseId === form.courseId);

  const create = async (event) => {
    event.preventDefault();
    if (!form.courseId || !form.lessonId) return pushToast('courseId and lessonId are required', 'error');
    if (!form.content.trim() && !form.fileUrl.trim()) return pushToast('content or fileUrl is required', 'error');
    await api.post('/submissions', form);
    pushToast('Submission created', 'success');
    setForm((p) => ({ ...p, content: '', fileUrl: '' }));
    await load();
  };

  const gradeSubmit = async (id) => {
    const value = Number(grade[id]?.grade);
    if (Number.isNaN(value) || value < 0) return pushToast('Grade must be numeric and >= 0', 'error');
    await api.post(`/submissions/${id}/grade`, { grade: value, feedback: grade[id]?.feedback || '', status: grade[id]?.status || 'graded' });
    pushToast('Graded', 'success');
    await load();
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Submissions</h2>
      {items.length === 0 && <div className="text-slate-500">No submissions.</div>}
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="rounded border bg-white p-3">
            <div className="text-sm">{s.id} | {s.status} | {s.content || '(file only)'}</div>
            <div className="text-xs text-slate-600">file: {s.fileUrl || '-'}</div>
            {canGrade && (
              <div className="mt-2 flex gap-2">
                <input className="rounded border px-2 py-1" placeholder="grade" onChange={(e) => setGrade((p) => ({ ...p, [s.id]: { ...p[s.id], grade: e.target.value } }))} />
                <input className="rounded border px-2 py-1" placeholder="feedback" onChange={(e) => setGrade((p) => ({ ...p, [s.id]: { ...p[s.id], feedback: e.target.value } }))} />
                <button className="rounded bg-indigo-600 px-2 text-white" onClick={() => gradeSubmit(s.id).catch((e) => pushToast(e.message, 'error'))}>Grade</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {canSubmit && (
        <form onSubmit={(e) => create(e).catch((err) => pushToast(err.message, 'error'))} className="grid gap-2 rounded border bg-white p-3 md:grid-cols-2">
          <select required className="rounded border px-2 py-1" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value, lessonId: '' })}><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
          <select required className="rounded border px-2 py-1" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: e.target.value })}><option value="">Select lesson</option>{filteredLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select>
          {courses.length === 0 || filteredLessons.length === 0 ? <div className="md:col-span-2 text-sm text-amber-700">Create/select a course and lesson first</div> : null}
          <textarea className="md:col-span-2 rounded border px-2 py-1" placeholder="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <input className="md:col-span-2 rounded border px-2 py-1" placeholder="fileUrl" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          <button className="w-fit rounded bg-emerald-600 px-3 py-1 text-white">Create Submission</button>
        </form>
      )}
    </section>
  );
}
