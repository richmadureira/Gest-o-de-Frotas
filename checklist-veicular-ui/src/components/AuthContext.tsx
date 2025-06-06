import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'gestor' | 'condutor' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<UserRole>(() => (localStorage.getItem('role') as UserRole) || null);

  const login = (token: string, role: UserRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role || '');
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 