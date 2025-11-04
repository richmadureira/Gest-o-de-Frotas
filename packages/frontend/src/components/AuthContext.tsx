import React, { createContext, useContext, useState, ReactNode } from 'react';
import { login as apiLogin } from '../services/api';

export type UserRole = 'admin' | 'gestor' | 'condutor' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  primeiroLogin?: boolean;
  cnhVencida?: boolean;
  cnhVenceEm?: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  user: User | null;
  primeiroLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePrimeiroLogin: (value: boolean) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para mapear o role do backend para o formato usado no frontend
const mapRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'Administrador': 'admin',
    'administrador': 'admin',
    'Gestor': 'gestor',
    'gestor': 'gestor',
    'Condutor': 'condutor',
    'condutor': 'condutor'
  };
  
  return roleMap[backendRole] || null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const role = localStorage.getItem('role');
    return role ? mapRole(role) : null;
  });
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [primeiroLogin, setPrimeiroLogin] = useState<boolean>(() => {
    const primeiroLoginStr = localStorage.getItem('primeiroLogin');
    return primeiroLoginStr === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(email, password);
      
      console.log('[AuthContext] Resposta do login:', response);
      console.log('[AuthContext] primeiroLogin recebido:', response.user.primeiroLogin);
      
      // Mapear o role corretamente
      const mappedRole = mapRole(response.user.role);
      
      // Armazenar dados no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', mappedRole || '');
      localStorage.setItem('primeiroLogin', String(response.user.primeiroLogin || false));
      
      console.log('[AuthContext] localStorage.primeiroLogin:', localStorage.getItem('primeiroLogin'));
      
      // Atualizar estado
      setIsAuthenticated(true);
      setUserRole(mappedRole);
      setUser(response.user);
      setPrimeiroLogin(response.user.primeiroLogin || false);
      
      console.log('[AuthContext] Estado atualizado - primeiroLogin:', response.user.primeiroLogin || false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('primeiroLogin');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    setPrimeiroLogin(false);
    setError(null);
  };

  const updatePrimeiroLogin = (value: boolean) => {
    setPrimeiroLogin(value);
    localStorage.setItem('primeiroLogin', String(value));
    if (user) {
      const updatedUser = { ...user, primeiroLogin: value };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      user, 
      primeiroLogin,
      login, 
      logout, 
      updatePrimeiroLogin,
      loading, 
      error 
    }}>
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