import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canEditSubmission } from '../utils/submissionAccess';
import StatusBadge from './StatusBadge';

export default function SubmissionCard({ submission }) {
  const { user } = useAuth();
  const { course_id, lesson_id } = useParams();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Submission #{submission.id}</h3>
          <p className="text-sm text-slate-500">Student: {submission.user_id}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>
      <p className="line-clamp-2 text-sm text-slate-700">{submission.content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
          to={`/courses/${course_id}/lessons/${lesson_id}/submissions/${submission.id}`}
        >
          View
        </Link>
        {canEditSubmission(user, submission) && (
          <Link
            className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
            to={`/courses/${course_id}/lessons/${lesson_id}/submissions/${submission.id}/edit`}
          >
            Edit
          </Link>
        )}
      </div>
    </article>
  );
}
