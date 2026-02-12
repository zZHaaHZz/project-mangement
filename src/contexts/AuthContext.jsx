import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user từ localStorage khi component mount
        const loadUserFromStorage = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                // Set token vào authApi
                authApi.setToken(token);
                // Lấy user từ localStorage (data cũ)
                const savedUser = authApi.getCurrentUserFromStorage();

                if (savedUser && savedUser.id) {
                    try {
                        // Gọi API để lấy thông tin mới nhất từ server
                        const freshUser = await usersApi.getUserById(savedUser.id);

                        if (freshUser && freshUser.approved === true) {
                            // Cập nhật thông tin mới nhất vào state và storage
                            setUser(freshUser);
                            authApi.saveUserToStorage(freshUser);
                        } else {
                            // User bị hủy ngang quyền duyệt
                            logout();
                        }
                    } catch (error) {
                        // Nếu user không tồn tại (404) hoặc lỗi token
                        console.error('Verify user error:', error);
                        logout();
                    }
                } else {
                    // Không có user trong localStorage
                    logout();
                }
            }
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials.email, credentials.password);

            // Kiểm tra user đã được duyệt chưa
            if (response.user && response.user.approved !== true) {
                // User chưa được duyệt, không cho login
                authApi.logout(); // Xóa token và user khỏi localStorage
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
            // Khóa chặt role là 'staff' và approved là false để tránh nâng cấp quyền trái phép
            const secureUserData = {
                ...userData,
                role: 'staff',
                approved: false
            };
            await authApi.register(secureUserData);
            // Xóa token ngay lập tức vì user chưa được duyệt
            localStorage.removeItem('token');
            authApi.setToken(null);
            // Không set user ở đây vì cần được duyệt mới được login
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const value = {
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
