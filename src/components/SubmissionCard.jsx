import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canEditSubmission, getSubmissionType } from '../utils/submissionAccess';
import StatusBadge from './StatusBadge';

export default function SubmissionCard({ submission }) {
  const { user } = useAuth();
  const { course_id, lesson_id } = useParams();
  const resolvedLessonId = lesson_id || submission.lesson_id;
  const submissionType = getSubmissionType(submission);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{submission.user_id}</h3>
          <p className="text-xs text-slate-500">Type: {submissionType}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <p className="line-clamp-2 text-sm text-slate-700">{submission.content}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        {submission.grade_point !== null && <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Grade: {submission.grade_point}</span>}
        {submission.group_members?.length > 0 && <span className="rounded-full bg-slate-100 px-2 py-1">Group: {submission.group_members.join(', ')}</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white" to={`/courses/${course_id}/lessons/${resolvedLessonId}/submissions/${submission.id}`}>
          View
        </Link>
        {canEditSubmission(user, submission) ? (
          <Link className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800" to={`/courses/${course_id}/lessons/${resolvedLessonId}/submissions/${submission.id}/edit`}>
            Edit
          </Link>
        ) : (
          <button className="cursor-not-allowed rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400" disabled>
            Edit Locked
          </button>
        )}
      </div>
    </article>
  );
}
