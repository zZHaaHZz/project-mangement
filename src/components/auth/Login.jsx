import React, { useState } from 'react';
import { Input, Button, Alert, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  // Local state cho form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sử dụng AuthContext để quản lý authentication state
  const { login } = useAuth();

  // Event handler với state management
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Login thành công, AuthContext sẽ tự động update state
    } catch (err) {
      setError(err?.message || 'Login failed: ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Welcome heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          PROJECT MANAGEMENT
        </h1>
        <p className="text-gray-600 text-base">Chào mừng bạn quay lại! Vui lòng nhập thông tin của bạn.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Email input */}
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700 ">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full"
            size="large"
            placeholder="Nhập email"
          />
        </div>

        {/* Password input */}
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Mật khẩu</label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full"
            size="large"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {/* Error message */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {/* Terms & Conditions and Forgot Password */}
        <div className="flex items-center justify-between mb-6">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          >
            <span className="text-sm text-gray-600">Điều khoản và dịch vụ</span>
          </Checkbox>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Handle forgot password
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Quên mật khẩu
          </a>
        </div>

        {/* Login button */}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
          size="large"
          style={{
            height: '48px',
            borderRadius: '10px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <span className="text-gray-600">Bạn chưa có tài khoản? </span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/register');
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Đăng ký miễn phí
        </a>
      </div>
    </div>
  );
};

export default Login;