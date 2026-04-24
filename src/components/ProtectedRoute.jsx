import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/courses/course-1/lessons/lesson-1/submissions" replace />;
  }

  return children;
}
