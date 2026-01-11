import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { User, LoginCredentials } from '../models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: { email: string; password: string; name: string; role?: 'leader' | 'staff' }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLeader: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user từ localStorage khi component mount
    const loadUserFromStorage = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Set token vào apiClient
        apiClient.setToken(token);
        // Lấy user từ localStorage
        const savedUser = apiClient.getCurrentUserFromStorage();
        if (savedUser) {
          setUser(savedUser);
        } else {
          // Không có user trong localStorage, xóa token
          localStorage.removeItem('token');
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.login(credentials.email, credentials.password);
      
      // Kiểm tra user đã được duyệt chưa
      if (response.user && response.user.approved === false) {
        // User chưa được duyệt, không cho login
        apiClient.logout(); // Xóa token và user khỏi localStorage
        throw new Error('Tài khoản của bạn chưa được Leader duyệt. Vui lòng đợi Leader phê duyệt.');
      }
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role?: 'leader' | 'staff' }) => {
    try {
      // Mặc định role là 'staff' nếu không được cung cấp
      const userDataWithRole = { ...userData, role: userData.role || 'staff' };
      const response = await apiClient.register(userDataWithRole);
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLeader: user?.role === 'leader',
    isStaff: user?.role === 'staff',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

