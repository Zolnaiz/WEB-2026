import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from '../components/ForbiddenPage';
import { useAuthUser } from '../../auth/useAuthUser';
import { canEditSubmission } from '../utils/accessControl';

function useSubmissionFromQuery() {
  const location = useLocation();

  return useMemo(() => {
    const search = new URLSearchParams(location.search);
    return {
      studentId: search.get('studentId'),
      gradeStatus: search.get('gradeStatus') ?? 'ungraded',
    };
  }, [location.search]);
}

export default function EditSubmissionPage() {
  const { course_id: courseId, lesson_id: lessonId, submission_id: submissionId } = useParams();
  const currentUser = useAuthUser();
  const submission = useSubmissionFromQuery();

  if (!canEditSubmission(currentUser, submission)) {
    return <ForbiddenPage />;
  }

  return (
    <main>
      <h1>Edit Submission</h1>
      <p>
        Editing submission {submissionId} for course {courseId}, lesson {lessonId}.
      </p>
    </main>
  );
}
