import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForbiddenPage from './pages/ForbiddenPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import LessonsPage from './pages/LessonsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ExamsPage from './pages/ExamsPage';
import AttendancePage from './pages/AttendancePage';
import GroupsPage from './pages/GroupsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ApiModulePage from './pages/ApiModulePage';

const inShell = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={inShell(<UsersPage />, ['admin', 'schooladmin'])} />
                <Route path="/courses" element={inShell(<CoursesPage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/lessons" element={inShell(<LessonsPage />, ['admin', 'teacher', 'student'])} />
                <Route path="/submissions" element={inShell(<SubmissionsPage />, ['admin', 'teacher', 'student'])} />
                <Route path="/exams" element={inShell(<ExamsPage />, ['admin', 'teacher', 'student'])} />
                <Route path="/attendance" element={inShell(<AttendancePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/groups" element={inShell(<GroupsPage />, ['admin', 'teacher', 'student'])} />
                <Route path="/schools/current" element={inShell(<ApiModulePage />, ['admin', 'schooladmin'])} />
                <Route path="/roles" element={inShell(<ApiModulePage />, ['admin', 'schooladmin'])} />
                <Route path="/profile" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/profile/change-password" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/courses/:course_id/users" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher'])} />
                <Route path="/courses/:course_id/users/edit" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher'])} />
                <Route path="/courses/:course_id/groups/:group_id/users" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher'])} />
                <Route path="/question-types" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher'])} />
                <Route path="/question-levels" element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher'])} />
                <Route path="/courses/:course_id/questions" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/courses/:course_id/question-points" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/courses/:course_id/questions/create" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/courses/:course_id/questions/:question_id" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/courses/:course_id/questions/:question_id/edit" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/courses/:course_id/questions/report" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/courses/:course_id/grade" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/grade" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/course/:course_id/attendances" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/course/:course_id/attendances/:lesson_id" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="/course/:course_id/attendances/:lesson_id/requests" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/course/:course_id/attendances/requests" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/exams/:exam_id/report" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/exams/:exam_id/students/:student_id/check" element={inShell(<ApiModulePage />, ['admin', 'teacher'])} />
                <Route path="/exams/:exam_id/students/:student_id/result" element={inShell(<ApiModulePage />, ['admin', 'teacher', 'student'])} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
