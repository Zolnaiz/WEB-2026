import React from 'react';

const STATUS_STYLES = {
  Submitted: 'bg-blue-100 text-blue-700',
  Graded: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const previewText = (value = '', limit = 120) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trimEnd()}…`;
};

export default function SubmissionCard({
  submission,
  currentRole,
  onView,
  onEdit,
  onGrade,
}) {
  const {
    id,
    title,
    content,
    owner,
    groupName,
    createdAt,
    updatedAt,
    status = 'Pending',
  } = submission;

  const canEdit = currentRole === 'student' && status !== 'Graded';
  const canGrade = currentRole === 'teacher';

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title || 'Untitled Submission'}</h3>
          <p className="mt-1 text-sm text-slate-600">{previewText(content)}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[status] || STATUS_STYLES.Pending
          }`}
        >
          {status}
        </span>
      </header>

      <dl className="space-y-1 text-sm text-slate-600">
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">Owner:</dt>
          <dd>{owner?.name || owner?.email || 'Unknown'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">Group:</dt>
          <dd>{groupName || 'Individual'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">Submitted:</dt>
          <dd>{formatDate(createdAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-700">Updated:</dt>
          <dd>{formatDate(updatedAt)}</dd>
        </div>
      </dl>

      <footer className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView?.(submission)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View
        </button>

        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit?.(submission)}
            className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            Edit
          </button>
        )}

        {canGrade && (
          <button
            type="button"
            onClick={() => onGrade?.(submission)}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Grade
          </button>
        )}
      </footer>
    </article>
  );
}
