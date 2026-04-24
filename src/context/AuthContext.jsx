import React, { createContext, useContext, useMemo, useState } from 'react';

const MOCK_USERS = {
  student: { id: 'user-student-1', role: 'student' },
  teacher: { id: 'user-teacher-1', role: 'teacher' },
  admin: { id: 'user-admin-1', role: 'admin' },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState('student');

  const user = useMemo(() => MOCK_USERS[role] ?? MOCK_USERS.student, [role]);

  const value = useMemo(
    () => ({
      user,
      role,
      switchRole: (nextRole) => {
        if (MOCK_USERS[nextRole]) setRole(nextRole);
      },
      availableRoles: Object.keys(MOCK_USERS),
    }),
    [user, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
