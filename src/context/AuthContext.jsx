import React, { createContext, useContext, useMemo, useState } from 'react';

const MOCK_USERS = {
  student: {
    id: 'user-student-1',
    role: 'student',
    group_id: 'group-a',
  },
  teacher: {
    id: 'user-teacher-1',
    role: 'teacher',
  },
  admin: {
    id: 'user-admin-1',
    role: 'admin',
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children, initialRole = 'student' }) {
  const [role, setRole] = useState(initialRole);
  const [groupId, setGroupId] = useState(MOCK_USERS[initialRole]?.group_id);

  const currentUser = useMemo(() => {
    const base = MOCK_USERS[role] ?? MOCK_USERS.student;

    if (role === 'student') {
      return {
        ...base,
        group_id: groupId,
      };
    }

    return base;
  }, [role, groupId]);

  const switchRole = (nextRole) => {
    if (!MOCK_USERS[nextRole]) {
      throw new Error(`Unsupported mock role: ${nextRole}`);
    }

    setRole(nextRole);
    setGroupId(MOCK_USERS[nextRole]?.group_id);
  };

  const value = useMemo(
    () => ({
      currentUser,
      role,
      switchRole,
      setGroupId,
      availableRoles: Object.keys(MOCK_USERS),
    }),
    [currentUser, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Alias requested in task, if the codebase prefers this naming.
export const useMockAuth = useAuth;
