import React, { useEffect, useState } from 'react';
import { validateGradeForm } from '../utils/validation';

export default function GradeModal({ open, submission, onClose, onSubmit, isSubmitting }) {
  const [values, setValues] = useState({
    grade_point: submission?.grade_point ?? '',
    feedback: submission?.feedback ?? '',
    status: submission?.status === 'needs_revision' ? 'needs_revision' : 'graded',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!submission) return;
    setValues({
      grade_point: submission.grade_point ?? '',
      feedback: submission.feedback ?? '',
      status: submission.status === 'needs_revision' ? 'needs_revision' : 'graded',
    });
    setErrors({});
  }, [submission, open]);

  if (!open || !submission) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateGradeForm(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({ ...values, grade_point: Number(values.grade_point) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Grade Submission #{submission.id}</h3>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Grade (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={values.grade_point}
              onChange={(event) => {
                setValues((prev) => ({ ...prev, grade_point: event.target.value }));
                setErrors((prev) => ({ ...prev, grade_point: '' }));
              }}
              className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
            />
            {errors.grade_point && <p className="mt-1 text-sm text-red-600">{errors.grade_point}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Outcome</label>
            <select
              value={values.status}
              onChange={(event) => setValues((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
            >
              <option value="graded">Graded</option>
              <option value="needs_revision">Needs revision</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Feedback</label>
            <textarea
              value={values.feedback}
              onChange={(event) => setValues((prev) => ({ ...prev, feedback: event.target.value }))}
              className="h-24 w-full rounded-md border border-slate-300 p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {isSubmitting ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
