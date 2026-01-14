import React, { useState, useRef } from 'react';
import { Input, Button, Alert } from 'antd';
import { apiClient } from '../../lib/api';

const Register = ({ onTabChange }) => {
  // Local state cho form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Ref để đảm bảo không tự động chuyển tab sau khi đăng ký thành công
  const hasRegisteredRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn event bubble up
    
    // Nếu đã đăng ký thành công, không cho submit lại
    if (success) {
      e.preventDefault();
      return;
    }
    
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // Tạo user với role leader, đã approved, nhưng KHÔNG có companyId
      // User sẽ tạo company khi đăng nhập lần đầu
      const response = await apiClient.createUser({ 
        name, 
        email, 
        password, 
        role: 'leader',
        approved// Leader tự động được approved
        // KHÔNG gán companyId và branchId
      });
      
      // Đăng ký thành công - KHÔNG tự động login, KHÔNG tự động chuyển tab
      hasRegisteredRef.current = true;
      setSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      
      // KHÔNG gọi onTabChange ở đây - user phải tự click
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại: ');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Welcome heading */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
      </div>
      
      {/* Subheading */}
      <div className="mb-8">
        <p className="text-gray-600">Tạo tài khoản để bắt đầu sử dụng dịch vụ.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(e);
        }}
        className="w-full"
        noValidate
      >
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Tên tài khoản</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-xl font-medium text-gray-700">Mật khẩu</label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
            className="w-full"
            size="large"
          />
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {success && (
          <Alert
            message="Đăng ký thành công!"
            description="Bạn có thể đăng nhập ngay. Khi đăng nhập lần đầu, bạn sẽ được yêu cầu tạo công ty của mình."
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        {!success ? (
        <Button 
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={loading}
          className="w-full bg-black hover-gray-800"
          size="large"
        >
            {loading ? 'Đang đăng ký...' : 'Đăng ký: '}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-gray-600 text-sm mb-4">
              Bạn có thể đóng trang này và quay lại sau khi được duyệt.
            </div>
            <Button 
              type="default"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('login: ');
              }}
              className="w-full"
              size="large"
            >
              Quay lại đăng nhập
        </Button>
          </div>
        )}
      </form>
      
      {/* Sign in link - chỉ hiển thị khi chưa đăng ký thành công */}
      {!success && (
      <div className="mt-6 text-center">
          <span className="text-gray-600">Bạn đã có tài khoản ? </span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('/login');
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
            Đăng nhập
        </a>
      </div>
      )}
    </div>
  );
};

export default Register;

