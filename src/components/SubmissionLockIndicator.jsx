import React from 'react';
import { getSubmissionLockReason } from '../utils/submissionAccess';

export default function SubmissionLockIndicator({ currentUser, submission }) {
  const reason = getSubmissionLockReason(currentUser, submission);

  if (!reason) {
    return null;
  }

  return (
    <p
      role="status"
      aria-live="polite"
      style={{ color: '#9a3412', fontWeight: 600, marginTop: '0.5rem' }}
      data-testid="submission-lock-indicator"
    >
      {reason}
    </p>
  );
}
