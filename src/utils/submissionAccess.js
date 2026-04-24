export function isSubmissionGraded(submission) {
  return submission?.status === 'graded' || Boolean(submission?.graded_at);
}

export function canViewSubmission(currentUser, submission) {
  if (!currentUser || !submission) return false;

  if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
    return true;
  }

  if (currentUser.role === 'student') {
    return submission.student_id === currentUser.id;
  }

  return false;
}

export function canEditSubmission(currentUser, submission) {
  if (!currentUser || !submission) return false;

  if (currentUser.role !== 'student') {
    return false;
  }

  const isOwner = submission.student_id === currentUser.id;
  const locked = isSubmissionGraded(submission);

  return isOwner && !locked;
}

export function canGradeSubmission(currentUser) {
  if (!currentUser) return false;
  return currentUser.role === 'teacher' || currentUser.role === 'admin';
}

export function applyGradeToSubmission(submission, grade, graderId) {
  return {
    ...submission,
    grade,
    grader_id: graderId,
    status: 'graded',
    graded_at: new Date().toISOString(),
  };
}

export function getSubmissionLockReason(currentUser, submission) {
  if (isSubmissionGraded(submission)) {
    return 'Locked after grading';
  }

  if (currentUser?.role === 'student' && submission?.student_id !== currentUser?.id) {
    return 'You can only edit your own submission';
  }

  return null;
}
