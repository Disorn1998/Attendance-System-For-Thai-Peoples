// src/components/shared/ProtectedRoute.jsx
// Redirects unauthenticated users to /login.
// Redirects authenticated users to the correct dashboard based on role.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

/**
 * Protects a route — requires the user to be authenticated.
 * @param {{ children: React.ReactNode, requiredRole?: 'ADMIN' | 'EMPLOYEE' }} props
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, accessToken } = useAuthStore();
  const location = useLocation();

  // Not logged in — redirect to login, preserve intended destination
  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch — redirect to own dashboard
  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
