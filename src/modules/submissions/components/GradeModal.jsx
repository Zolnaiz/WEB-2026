import React, { useState } from 'react';

export default function GradeModal({ isOpen, submission, onClose, onSubmit }) {
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    const numericGrade = Number(grade);
    if (!Number.isFinite(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      setError('Grade must be a number between 0 and 100.');
      return;
    }

    setError('');
    onSubmit?.({
      submissionId: submission?.id,
      grade: numericGrade,
      comment: comment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Grade Submission</h3>
        <p className="mt-1 text-sm text-slate-600">{submission?.title || 'Untitled Submission'}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="grade-value" className="mb-1 block text-sm font-medium text-slate-700">
              Grade (0–100)
            </label>
            <input
              id="grade-value"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={grade}
              onChange={(event) => {
                setGrade(event.target.value);
                setError('');
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="grade-comment" className="mb-1 block text-sm font-medium text-slate-700">
              Feedback
            </label>
            <textarea
              id="grade-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Provide feedback for the student(s)"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Save Grade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
