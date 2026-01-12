import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ConfigProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ConfigProvider>
    </React.StrictMode>
);
