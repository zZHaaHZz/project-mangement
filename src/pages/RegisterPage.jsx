import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import Register from '@/components/auth/Register';

const RegisterPage = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p>Loading...</p>
            </div>
        );
    }

    // Nếu đã đăng nhập, redirect về dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthLayout>
            <Register />
        </AuthLayout>
    );
};

export default RegisterPage;
