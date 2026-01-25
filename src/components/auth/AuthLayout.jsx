import React, { useState, useEffect } from 'react';
import loginImage from '../../assets/images/login-image.png';

const AuthLayout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full max-w-7xl h-[75vh] flex flex-row shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-100">
                {/* Left side - Image */}
                {!isMobile && (
                    <div className="flex w-1/2 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 items-center justify-center p-8 relative min-h-[400px]">
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        <div className="w-full h-full flex items-center justify-center relative z-10">
                            <img
                                src={loginImage}
                                alt="Login illustration"
                                className="object-contain w-full h-auto max-h-[500px] drop-shadow-2xl"
                            />
                        </div>
                        <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                            <h2 className="text-2xl font-bold mb-2">Chào mừng đến với</h2>
                            <p className="text-lg opacity-90">Hệ thống quản lý dự án hiện đại</p>
                        </div>
                    </div>
                )}

                {/* Right side - Form */}
                <div className={`flex items-center justify-center p-4 lg:p-8 bg-white overflow-y-auto ${isMobile ? 'w-full' : 'w-1/2'}`}>
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
