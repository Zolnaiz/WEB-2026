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
import ApiModulePage from './pages/ApiModulePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

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
                <Route path="/lessons" element={inShell(<LessonsPage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/submissions" element={inShell(<SubmissionsPage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/exams" element={inShell(<ExamsPage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/attendance" element={inShell(<AttendancePage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                <Route path="/groups" element={inShell(<GroupsPage />, ['admin', 'schooladmin', 'teacher'])} />
                {['/roles', '/school', '/grade', '/profile', '/profile/change-password', '/question-types', '/question-levels'].map((path) => (
                  <Route key={path} path={path} element={inShell(<ApiModulePage />, ['admin', 'schooladmin', 'teacher', 'student'])} />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
