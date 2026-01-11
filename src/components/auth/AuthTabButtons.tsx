import React from 'react';
import { Button } from 'antd';

interface AuthTabButtonsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

const AuthTabButtons: React.FC<AuthTabButtonsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2.5 mt-5">
      <Button
        type={activeTab === 'login' ? 'primary' : 'default'}
        onClick={() => onTabChange('login')}
        className="flex-1"
        size="large"
      >
        Login
      </Button>
      <Button
        type={activeTab === 'register' ? 'primary' : 'default'}
        onClick={() => onTabChange('register')}
        className="flex-1"
        size="large"
      >
        Register
      </Button>
    </div>
  );
};

export default AuthTabButtons;

