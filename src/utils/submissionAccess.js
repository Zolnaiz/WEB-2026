export const isSubmissionGraded = (submission) => submission?.status === 'graded';

export const canEditSubmission = (user, submission) => {
  if (!user || !submission) return false;
  if (user.role === 'admin') return true;
  return user.role === 'student' && user.id === submission.user_id && !isSubmissionGraded(submission);
};

export const canGradeSubmission = (user) => ['teacher', 'admin'].includes(user?.role);

export const canViewSubmission = (user, submission) => {
  if (!user || !submission) return false;
  if (['teacher', 'admin'].includes(user.role)) return true;
  return user.role === 'student' && user.id === submission.user_id;
};

export const getStatusBadgeClass = (status) => {
  if (status === 'graded') return 'bg-emerald-100 text-emerald-700';
  if (status === 'late') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};
