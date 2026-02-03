import React from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { apiClient } from '@/lib/api';

const { TextArea } = Input;

const UserModal = ({
  open,
  editingUser,
  onCancel,
  onSuccess,
  form,
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  // Set values when opening
  React.useEffect(() => {
    if (open) {
      if (editingUser) {
        form.setFieldsValue({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          approved: editingUser.approved !== undefined ? editingUser.approved : true
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingUser) {
        const updateData = {
          ...values,
          approved: values.approved !== undefined ? values.approved : editingUser.approved,
        };
        await apiClient.updateUser(editingUser.id, updateData);
        message.success('Cập nhật nhân viên thành công');
      } else {
        const createData = {
          ...values,
          approved: values.approved !== undefined ? values.approved : false,
          createdAt: new Date().toISOString(),
        };
        await apiClient.createUser(createData);
        message.success('Tạo nhân viên mới thành công');
      }
      onSuccess();
    } catch (error) {
      if (!error.errorFields) {
        message.error('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
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
      <div className="relative w-full bg-white flex flex-col border border-gray-100 font-sans text-stone-900">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#333] tracking-tight text-2xl font-bold leading-tight">
              {editingUser ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
            </h1>
            <p className="text-gray-500 text-sm font-normal">
              {editingUser ? 'Cập nhật thông tin và quyền hạn của nhân viên' : 'Tạo tài khoản mới cho thành viên trong đội ngũ'}
            </p>
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
              label={<span className="text-[#333] text-sm font-semibold">Họ và tên <span className="text-primary">*</span></span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              className="mb-6"
            >
              <Input
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
              />
            </Form.Item>

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
                disabled={!!editingUser}
                placeholder="email@example.com"
                className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all disabled:opacity-60"
              />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                label={<span className="text-[#333] text-sm font-semibold">Mật khẩu <span className="text-primary">*</span></span>}
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                ]}
                className="mb-6"
              >
                <Input.Password
                  placeholder="Nhập ít nhất 6 ký tự"
                  className="w-full rounded-lg text-[#333] focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent bg-[#F3F4F6] h-12 placeholder:text-gray-400 px-4 text-base font-normal transition-all"
                />
              </Form.Item>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Form.Item
                label={<span className="text-[#333] text-sm font-semibold">Vai trò <span className="text-primary">*</span></span>}
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                className="mb-0"
              >
                <Select
                  className="task-select-charcoal h-12"
                  placeholder="Chọn vai trò"
                  options={[
                    { value: "staff", label: "Nhân viên (Staff)" },
                    { value: "leader", label: "Quản lý (Leader)" },
                  ]}
                  suffixIcon={<span className="material-symbols-outlined text-gray-400">unfold_more</span>}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[#333] text-sm font-semibold">Trạng thái phê duyệt</span>}
                className="mb-0"
              >
                <div className="h-12 flex items-center bg-[#F3F4F6] px-4 rounded-lg">
                  <Form.Item name="approved" valuePropName="checked" noStyle>
                    <Switch
                      className="custom-switch-primary"
                      checkedChildren="Đã duyệt"
                      unCheckedChildren="Chờ duyệt"
                    />
                  </Form.Item>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.approved !== curValues.approved} noStyle>
                    {() => (
                      <span className="ml-3 text-sm text-gray-500 font-medium">
                        {form.getFieldValue('approved') ? 'Cho phép đăng nhập' : 'Tạm khóa đăng nhập'}
                      </span>
                    )}
                  </Form.Item>
                </div>
              </Form.Item>
            </div>
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
            {submitting ? "Đang lưu..." : (editingUser ? "Cập nhật" : "Tạo mới")}
          </button>
        </div>
      </div>

      <style>{`
        .task-modal-charcoal .ant-modal-content {
          padding: 0 !important;
          background: white !important;
          box-shadow: none !important;
        }
        
        .task-select-charcoal .ant-select-selector {
          background-color: #F3F4F6 !important;
          border: 1px solid transparent !important;
          color: #333 !important;
          border-radius: 8px !important;
          padding: 0 16px !important;
          font-weight: 400 !important;
          transition: all 0.2s !important;
        }

        .task-select-charcoal.ant-select-focused .ant-select-selector {
          border-color: #FF4081 !important;
          box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.2) !important;
          background-color: white !important;
        }

        .custom-switch-primary.ant-switch-checked {
          background-color: #FF4081 !important;
        }

        .ant-modal-mask {
          background-color: rgba(255, 255, 255, 0.45) !important;
          backdrop-filter: blur(8px) !important;
        }
      `}</style>
    </Modal>
  );
};

export default UserModal;
