import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, message, Select } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { usersApi } from '../../lib/api';
import { User } from '../../models';

const { Option } = Select;

interface InviteUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Kiểm tra xem email đã tồn tại chưa
      const allUsers = await usersApi.getUsers();
      const existingUser = allUsers.find((u: User) => u.email === values.email);
      
      if (existingUser) {
        // Email đã tồn tại
        message.warning('Email này đã tồn tại trong hệ thống.');
        return;
      } else {
        // Email chưa tồn tại - tạo tài khoản mới với mật khẩu tạm thời
        const userData = {
          name: values.name || values.email.split('@')[0], // Tên mặc định từ email
          email: values.email,
          password: values.password || '123456', // Mật khẩu tạm thời
          role: 'staff' as const,
          approved: false, // Chờ duyệt
        };

        await usersApi.createUser(userData);
        message.success('Đã gửi lời mời thành công! Nhân viên sẽ nhận email hướng dẫn đăng nhập với mật khẩu tạm thời.');
      }
      
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error('Lỗi: ' + (error.message || 'Không thể gửi lời mời'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      title={
        <span>
          <MailOutlined className="mr-2" />
          Mời nhân viên tham gia
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Email nhân viên"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email nhân viên" />
        </Form.Item>

        <Form.Item
          label="Tên nhân viên (tùy chọn)"
          name="name"
        >
          <Input placeholder="Để trống sẽ dùng tên từ email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu tạm thời (chỉ cho tài khoản mới)"
          name="password"
          rules={[
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
          help="Chỉ cần nhập nếu tài khoản chưa tồn tại. Để trống sẽ dùng mật khẩu mặc định: 123456"
        >
          <Input.Password placeholder="Nhập mật khẩu tạm thời (tùy chọn)" />
        </Form.Item>

        <Form.Item className="mb-0 mt-6">
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi lời mời
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteUserModal;

