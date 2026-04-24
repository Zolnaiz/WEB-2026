const ELEVATED_ROLES = new Set(['teacher', 'admin']);

export function canListSubmissions(user) {
  return ['student', 'teacher', 'admin'].includes(user?.role);
}

export function canCreateSubmission(user) {
  return ['student', 'admin'].includes(user?.role);
}

export function canEditSubmission(user, submission) {
  if (!user) return false;

  if (user.role === 'admin' || user.role === 'teacher') {
    return true;
  }

  if (user.role !== 'student') {
    return false;
  }

  if (!submission) {
    return false;
  }

  const isOwner = submission.studentId === user.id;
  const isUngraded = submission.gradeStatus === 'ungraded';

  return isOwner && isUngraded;
}

export function canGradeSubmission(user) {
  return ELEVATED_ROLES.has(user?.role);
}
