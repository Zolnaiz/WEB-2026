import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthUser } from '../modules/auth/useAuthUser';
import ForbiddenPage from '../modules/submissions/components/ForbiddenPage';
import CourseSubmissionsPage from '../modules/submissions/pages/CourseSubmissionsPage';
import LessonSubmissionsPage from '../modules/submissions/pages/LessonSubmissionsPage';
import CreateSubmissionPage from '../modules/submissions/pages/CreateSubmissionPage';
import EditSubmissionPage from '../modules/submissions/pages/EditSubmissionPage';
import {
  canCreateSubmission,
  canGradeSubmission,
  canListSubmissions,
} from '../modules/submissions/utils/accessControl';

function ProtectedRoute({ allowed, children }) {
  return allowed ? children : <ForbiddenPage />;
}

export default function AppRoutes() {
  const currentUser = useAuthUser();
  const canList = canListSubmissions(currentUser);
  const canCreate = canCreateSubmission(currentUser);
  const canTeachOrAdmin = canGradeSubmission(currentUser);

  return (
    <Routes>
      <Route
        path="/courses/:course_id/submissions"
        element={
          <ProtectedRoute allowed={canList}>
            <CourseSubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:course_id/lessons/:lesson_id/submissions"
        element={
          <ProtectedRoute allowed={canList || canTeachOrAdmin}>
            <LessonSubmissionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:course_id/lessons/:lesson_id/submissions/create"
        element={
          <ProtectedRoute allowed={canCreate}>
            <CreateSubmissionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:course_id/lessons/:lesson_id/submissions/:submission_id/edit"
        element={<EditSubmissionPage />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
