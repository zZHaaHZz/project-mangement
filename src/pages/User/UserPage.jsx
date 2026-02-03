import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, message, Table } from 'antd';
import { useNavigate } from "react-router-dom";
import { apiClient, projectMembersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { isLeader } from '@/lib/utils/permissions';
import UserModal from "@/components/User/UserModal";
import InviteUserModal from "@/components/User/InviteUserModal";

const UserPage = () => {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectCounts, setProjectCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Check permissions
  useEffect(() => {
    if (currentUser && !isLeader(currentUser)) {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  // Fetch users and project counts
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, membersData] = await Promise.all([
        apiClient.getUsers(),
        projectMembersApi.getProjectMembers()
      ]);

      setAllUsers(usersData);

      // Calculate project counts per user
      const counts = {};
      if (Array.isArray(membersData)) {
        membersData.forEach(member => {
          counts[member.userId] = (counts[member.userId] || 0) + 1;
        });
      }
      setProjectCounts(counts);

    } catch (error) {
      console.error("Fetch error:", error);
      message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isLeader(currentUser)) {
      fetchData();
    }
  }, [currentUser]);

  // Handle Delete
  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      await apiClient.deleteUser(userId);
      message.success('Xóa user thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi: ' + (error.message || 'Không thể xóa user'));
    }
  };

  // Modal Handlers
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

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

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
    fetchData();
  };

  // Search Logic
  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) {
      return allUsers;
    }
    const searchLower = searchText.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [allUsers, searchText]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase() + (name.trim().split(" ").length > 1 ? name.trim().split(" ").pop().charAt(0).toUpperCase() : "");
  };

  const getAvatarColor = (id) => {
    const colors = ['bg-primary/10 text-primary', 'bg-indigo-50 text-indigo-500', 'bg-emerald-50 text-emerald-500', 'bg-amber-50 text-amber-500', 'bg-purple-50 text-purple-500'];
    return colors[id % colors.length];
  };

  // Column Definitions
  const columns = [
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider pl-6">Họ và tên</span>,
      key: 'name',
      render: (_, user) => (
        <div className="flex items-center gap-4 pl-6">
          <div className={`size-12 rounded-full bg-center bg-cover flex items-center justify-center font-bold text-xl ${getAvatarColor(user.id)}`}
            style={user.avatar ? { backgroundImage: `url('${user.avatar}')` } : {}}
          >
            {!user.avatar && getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500 font-medium">ID: EMP-{String(user.id).padStart(4, '0')}</p>
          </div>
        </div>
      )
    },
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider">Chức vụ</span>,
      key: 'role',
      render: (_, user) => (
        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-bold border transform scale-110 origin-left ${user.role === 'leader' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
          {user.role === 'leader' ? 'Leader' : 'Staff'}
        </span>
      )
    },
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider">Email</span>,
      key: 'email',
      dataIndex: 'email',
      render: (email) => <span className="text-base font-medium text-slate-600 dark:text-slate-400">{email}</span>
    },
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider">Dự án tham gia</span>,
      key: 'projects',
      render: (_, user) => (
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold text-slate-700 dark:text-slate-300">{projectCounts[user.id] || 0} dự án</span>
        </div>
      )
    },
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider">Trạng thái</span>,
      key: 'status',
      render: (_, user) => (
        <div className={`flex items-center gap-2 font-bold text-sm uppercase tracking-tight ${user.approved ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
          <span className={`size-2.5 rounded-full ${user.approved ? 'bg-green-500' : 'bg-slate-300'}`}></span>
          {user.approved ? 'Active' : 'Inactive'}
        </div>
      )
    },
    {
      title: <span className="text-base font-bold text-slate-500 uppercase tracking-wider text-right block pr-6">Hành động</span>,
      key: 'action',
      render: (_, user) => (
        <div className="flex items-center justify-end gap-2 pr-6">
          <button onClick={() => handleEdit(user)} className="p-2.5 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Sửa">
            <span className="material-symbols-outlined text-2xl">edit_square</span>
          </button>
          <button onClick={() => handleDelete(user.id)} className="p-2.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
            <span className="material-symbols-outlined text-2xl">delete</span>
          </button>
        </div>
      )
    }
  ];

  if (!currentUser || !isLeader(currentUser)) return null;

  return (
    <div className="p-10">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Quản lý nhân viên</h2>
          <p className="text-lg text-slate-500 mt-2">Quản lý các thành viên trong nhóm và phân quyền dự án.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none w-72 text-base transition-all"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-2xl">person_add</span>
            <span className="text-base">Thêm nhân viên</span>
          </button>
        </div>
      </div>

      {/* Members Table using Ant Design */}
      <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false, // Cleaner look
            className: "px-6 py-4 my-0 flex justify-end",
          }}
          rowClassName={() => "h-[60px] hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"}
          className="user-management-table"
        />
      </div>

      <UserModal
        open={isModalOpen}
        editingUser={editingUser}
        onCancel={() => { setIsModalOpen(false); setEditingUser(null); form.resetFields(); }}
        onSuccess={handleModalSuccess}
        form={form}
      />

      <InviteUserModal
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default UserPage;