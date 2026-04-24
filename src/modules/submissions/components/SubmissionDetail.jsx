import React from 'react';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export default function SubmissionDetail({ submission, canEdit = false, onEdit }) {
  if (!submission) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
        Select a submission to view details.
      </div>
    );
  }

  const isGraded = submission.status === 'Graded';
  const editLocked = isGraded || !canEdit;

  return (
    <article className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{submission.title || 'Untitled Submission'}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Submitted by {submission.owner?.name || 'Unknown'} on {formatDate(submission.createdAt)}
          </p>
          <p className="text-sm text-slate-600">Status: {submission.status || 'Pending'}</p>
        </div>

        <button
          type="button"
          onClick={() => onEdit?.(submission)}
          disabled={editLocked}
          className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGraded ? 'Editing Locked (Graded)' : 'Edit Submission'}
        </button>
      </header>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Content</h3>
        <p className="whitespace-pre-line text-slate-800">{submission.content || 'No content.'}</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Group Members</h3>
        {submission.groupMembers?.length ? (
          <ul className="list-inside list-disc space-y-1 text-slate-700">
            {submission.groupMembers.map((member) => (
              <li key={member.id || member.email || member.name}>{member.name || member.email}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600">No group members listed.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Teacher Feedback</h3>
        {submission.feedback ? (
          <>
            <p className="text-slate-800">{submission.feedback.comment}</p>
            {typeof submission.feedback.grade === 'number' && (
              <p className="mt-2 text-sm font-medium text-slate-700">Grade: {submission.feedback.grade}/100</p>
            )}
          </>
        ) : (
          <p className="text-slate-600">No feedback yet.</p>
        )}
      </section>
    </article>
  );
}
