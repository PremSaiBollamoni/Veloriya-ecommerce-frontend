import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { loginAdmin } from '../api/auth';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { logout, setUser, user } = useAuth();

  // Check admin status whenever user changes
  useEffect(() => {
    if (user?.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const adminLogin = async (email: string, password: string) => {
    try {
      const data = await loginAdmin(email, password);
      
      // Store the token
      localStorage.setItem('token', data.token);
      
      // Update user state
      setUser(data.user);
      setIsAdmin(true);
      
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    logout();
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 