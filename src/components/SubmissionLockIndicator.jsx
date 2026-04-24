import React from 'react';
import { isSubmissionGraded } from '../utils/submissionAccess';

export default function SubmissionLockIndicator({ currentUser, submission }) {
  if (!submission) return null;

  if (isSubmissionGraded(submission)) {
    return <p className="text-sm font-medium text-amber-700">Locked after grading.</p>;
  }

  if (currentUser?.role === 'student' && currentUser.id !== submission.user_id) {
    return <p className="text-sm font-medium text-amber-700">You can only edit your own submission.</p>;
  }

  return null;
}
