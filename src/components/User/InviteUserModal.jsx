import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { usersApi } from '@/lib/api';

const InviteUserModal = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Check if email exists
      const allUsers = await usersApi.getUsers();
      const existingUser = allUsers.find((u) => u.email === values.email);

      if (existingUser) {
        message.warning('Email này đã tồn tại trong hệ thống.');
        return;
      } else {
        const userData = {
          name: values.name || values.email.split('@')[0],
          email: values.email,
          password: values.password || '123456',
          role: 'staff',
          approved: false,
          createdAt: new Date().toISOString(),
        };

        await usersApi.createUser(userData);
        message.success('Đã gửi lời mời thành công! Nhân viên có thể đăng nhập sau khi được phê duyệt.');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      if (!error.errorFields) {
        message.error('Lỗi: ' + (error.message || 'Không thể gửi lời mời'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={600}
      centered
      className="task-modal-charcoal p-0"
      styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: '12px', overflow: 'hidden' } }}
    >
      <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">mail</span>
              Mời Thành Viên
            </h1>
            <p className="text-gray-500 text-sm font-normal">Gửi lời mời tham gia hệ thống quản lý dự án</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-[#333] transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-4 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar border-t border-gray-50">
          <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Địa chỉ Email <span className="text-primary">*</span></span>}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
              className="mb-6"
            >
              <Input
                placeholder="email@example.com"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Tên nhân viên (Mặc định dùng tên từ email nếu để trống)</span>}
              name="name"
              className="mb-6"
            >
              <Input
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[#333] text-sm font-semibold">Mật khẩu tạm thời (Để trống sẽ dùng: 123456)</span>}
              name="password"
              rules={[
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
              ]}
              className="mb-0"
            >
              <Input.Password
                placeholder="Nhập mật khẩu tạm thời"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
              />
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold border border-gray-300 bg-white hover:bg-gray-100 hover:text-[#333] transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => form.submit()}
            disabled={submitting}
            className="px-10 py-2.5 bg-primary rounded-lg text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi lời mời"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteUserModal;
