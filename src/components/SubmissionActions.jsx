import React from 'react';
import {
  applyGradeToSubmission,
  canEditSubmission,
  canGradeSubmission,
  isSubmissionGraded,
} from '../utils/submissionAccess';
import SubmissionLockIndicator from './SubmissionLockIndicator';

export default function SubmissionActions({
  currentUser,
  submission,
  onEdit,
  onSaveGrade,
}) {
  const editable = canEditSubmission(currentUser, submission);
  const gradeable = canGradeSubmission(currentUser);
  const locked = isSubmissionGraded(submission);

  const handleSaveGrade = (grade) => {
    if (!gradeable) return;
    const updated = applyGradeToSubmission(submission, grade, currentUser.id);
    onSaveGrade?.(updated);
  };

  return (
    <div>
      <button type="button" disabled={!editable} onClick={onEdit}>
        Edit submission
      </button>

      {gradeable && (
        <button
          type="button"
          disabled={locked}
          onClick={() => handleSaveGrade('A')}
        >
          Save grade
        </button>
      )}

      <SubmissionLockIndicator currentUser={currentUser} submission={submission} />
    </div>
  );
}
