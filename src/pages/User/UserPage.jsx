import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, message, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { apiClient } from '@/lib/api';
import { User } from '@/models';
import { useAuth } from '@/contexts/AuthContext';
import { isLeader } from '@/lib/utils/permissions';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import InviteUserModal from './components/InviteUserModal';

const { Search } = Input;

const UserPage = () => {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // Kiểm tra quyền - chỉ Leader mới có thể quản lý users
  useEffect(() => {
    if (currentUser && !isLeader(currentUser)) {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  // ⛔ Không render UI khi không đủ quyền
  if (!currentUser || !isLeader(currentUser)) {
    return null;
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setAllUsers(data);
    } catch (error) {
      message.error('Không thể tải danh sách users: ' + (error.message || 'Lỗi không xác định: '));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý xóa user
  const handleDelete = async (userId) => {
    try {
      await apiClient.deleteUser(userId);
      message.success('Xóa user thành công: ');
      fetchUsers();
    } catch (error) {
      message.error('Lỗi: ' + (error.message || 'Không thể xóa user: '));
    }
  };

  // Xử lý duyệt user
  const handleApprove = async (userId) => {
    try {
      await apiClient.updateUser(userId, { approved: true });
      message.success('Duyệt user thành công: ');
      fetchUsers();
    } catch (error) {
      message.error('Lỗi: ' + (error.message || 'Không thể duyệt user'));
    }
  };

  // Mở modal để thêm user
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Mở modal để sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved !== undefined ? user.approved : true
    });
    setIsModalOpen(true);
  };

  // Đóng modal và refresh data
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
    fetchUsers();
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };


  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filter users dựa trên searchText
  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) {
      return allUsers;
    }
    const searchLower = searchText.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }, [allUsers, searchText]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý nhân viên</h1>
          <Space>
            <Button
              type="default"
              icon={<MailOutlined />}
              onClick={() => setIsInviteModalOpen(true)}
              size="large"
            >
              Mời nhân viên
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm nhân viên
            </Button>
          </Space>
        </div>

        <div className="max-w-md">
          <Search
            placeholder="Tìm kiếm theo tên hoặc email nhân viên"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApprove}
      />

      <UserModal
        open={isModalOpen}
        editingUser={editingUser}
        onCancel={handleCancel}
        onSuccess={handleModalSuccess}
        form={form}
      />

      <InviteUserModal
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
};

export default UserPage;