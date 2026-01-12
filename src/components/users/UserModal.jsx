import React from 'react';
import { Modal, Form, Input, Select, Button, Space, message, Switch } from 'antd';
import { User } from '../../models';
import { apiClient } from '../../lib/api';

const { Option } = Select;

const UserModal = ({
  open,
  editingUser,
  onCancel,
  onSuccess,
  form,
}) => {
  // Set giá trị mặc định khi mở modal
  React.useEffect(() => {
    if (open) {
      if (editingUser) {
        // Edit mode: set giá trị từ user
        form.setFieldsValue({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          approved: editingUser.approved !== undefined ? editingUser.approved : true
        });
      } else {
        // Create mode: reset form
        form.resetFields();
      }
    }
  }, [open, editingUser, form]);


  // Xử lý thêm/sửa user
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update user
        // Đảm bảo approved là boolean
        const updateData = {
          ...values,
          approved: values.approved !== undefined ? values.approved : editingUser.approved,
        };
        await apiClient.updateUser(editingUser.id, updateData);
        message.success('Cập nhật user thành công: ');
      } else {
        // Create user - mặc định approved = false (chờ duyệt)
        const createData = {
          ...values,
          approved: values.approved !== undefined ? values.approved : false,
        };
        await apiClient.createUser(createData);
        message.success('Tạo user thành công: ');
      }
      onSuccess();
    } catch (error) {
      message.error('Lỗi: ' + (error.message || 'Không thể lưu user: '));
    }
  };

  return (
    <Modal
      title={editingUser ? 'Sửa nhân viên: ' : 'Thêm nhân viên mới: '}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Nhập tên nhân viên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email" disabled={!!editingUser} />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò: ' }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="staff">Staff</Option>
            <Option value="leader">Leader</Option>
          </Select>
        </Form.Item>

        {editingUser && (
          <Form.Item
            label="Trạng thái duyệt"
            name="approved"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Đã duyệt"
              unCheckedChildren="Chờ duyệt"
            />
          </Form.Item>
        )}

        <Form.Item className="mb-0 mt-6">
          <Space>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Cập nhật: ' : 'Tạo mới'}
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
