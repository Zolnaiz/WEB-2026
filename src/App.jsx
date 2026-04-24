import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import CourseSubmissionsPage from './pages/CourseSubmissionsPage';
import LessonSubmissionsPage from './pages/LessonSubmissionsPage';
import CreateSubmissionPage from './pages/CreateSubmissionPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import EditSubmissionPage from './pages/EditSubmissionPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/courses/course-1/submissions" replace />} />
        <Route
          path="/courses/:course_id/submissions"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CourseSubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:course_id/lessons/:lesson_id/submissions"
          element={<LessonSubmissionsPage />}
        />
        <Route
          path="/courses/:course_id/lessons/:lesson_id/submissions/create"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <CreateSubmissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:course_id/lessons/:lesson_id/submissions/:id"
          element={<SubmissionDetailPage />}
        />
        <Route
          path="/courses/:course_id/lessons/:lesson_id/submissions/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <EditSubmissionPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}
