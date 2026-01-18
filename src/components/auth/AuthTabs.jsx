import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import loginImage from '../../assets/images/login-image.png';

const AuthTabs = () => {
  // State để switch giữa Login và Register
  const [activeTab, setActiveTab] = useState('login');
  const [isMobile, setIsMobile] = useState(false);
  
  // Debug: Log khi activeTab thay đổi
  React.useEffect(() => {
    console.log('🔄 [AuthTabs] activeTab changed to:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      <div className="w-full max-w-7xl h-[70vh] flex flex-row shadow-2xl rounded-lg overflow-hidden bg-white">
        {/* Left side - Image */}
        {!isMobile && (
          <div className="flex w-1/2 bg-gradient-to-br items-center justify-center p-8 relative min-h-[400px]">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={loginImage}
                alt="Login illustration"
                className="object-contain w-full h-auto max-h-[500px]"
              />
            </div>
          </div>
        )}
        
        {/* Right side - Form */}
        <div className={`flex items-center justify-center p-4 lg:p-8 bg-white overflow-y-auto ${isMobile ? 'w-full' : 'w-1/2'}`}>
          <div className="w-full max-w-md">
            {activeTab === 'login' ? (
              <Login onTabChange={(tab) => {
                console.log('🔄 [AuthTabs] Login requested tab change to:', tab);
                setActiveTab(tab);
              }} />
            ) : (
              <Register onTabChange={(tab) => {
                console.log('🔄 [AuthTabs] Register requested tab change to:', tab);
                setActiveTab(tab);
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;

