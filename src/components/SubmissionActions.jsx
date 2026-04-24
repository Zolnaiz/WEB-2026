import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { canEditSubmission, canGradeSubmission, isSubmissionGraded } from '../utils/submissionAccess';
import SubmissionLockIndicator from './SubmissionLockIndicator';

export default function SubmissionActions({ currentUser, submission, onOpenGrade }) {
  const { course_id, lesson_id } = useParams();
  const editable = canEditSubmission(currentUser, submission);
  const gradeable = canGradeSubmission(currentUser);
  const locked = isSubmissionGraded(submission);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {editable && (
        <Link
          to={`/courses/${course_id}/lessons/${lesson_id}/submissions/${submission.id}/edit`}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Edit submission
        </Link>
      )}

      {gradeable && (
        <button
          type="button"
          disabled={locked}
          onClick={onOpenGrade}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {locked ? 'Graded' : 'Grade submission'}
        </button>
      )}

      <SubmissionLockIndicator currentUser={currentUser} submission={submission} />
    </div>
  );
}
