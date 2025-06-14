import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin } = useAdminAuth();
  const { user } = useAuth();

  if (!isAdmin || !user?.isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

export default AdminRoute; 