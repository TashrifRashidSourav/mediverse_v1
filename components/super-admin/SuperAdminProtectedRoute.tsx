import React from 'react';
import { Navigate } from 'react-router-dom';

interface SuperAdminProtectedRouteProps {
  children: React.ReactNode;
}

const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

  if (!isSuperAdmin) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminProtectedRoute;
