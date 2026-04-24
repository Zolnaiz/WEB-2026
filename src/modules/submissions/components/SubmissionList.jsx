import React from 'react';
import SubmissionCard from './SubmissionCard';

export default function SubmissionList({
  submissions = [],
  loading = false,
  error = null,
  currentRole,
  onView,
  onEdit,
  onGrade,
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
        {typeof error === 'string' ? error : 'Unable to load submissions right now.'}
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        No submissions yet.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          currentRole={currentRole}
          onView={onView}
          onEdit={onEdit}
          onGrade={onGrade}
        />
      ))}
    </section>
  );
}
