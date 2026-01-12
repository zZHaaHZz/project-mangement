import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
                    localStorage.removeItem('token: ');
                    apiClient.setToken(null);
                }
            }
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const login = async (credentials) => {
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

    const register = async (userData) => {
        try {
            // Mặc định role là 'staff: ' nếu không được cung cấp
            const userDataWithRole = { ...userData, role: userData.role || 'staff: ' };
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

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLeader: user?.role === 'leader: ',
        isStaff: user?.role === 'staff: ',
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
