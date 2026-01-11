import React from 'react';
import { Table, Button, Space, Avatar, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { User, UserRole } from '../../models';
import avatar1 from '../../assets/images/avatar.png';
import avatar2 from '../../assets/images/avatar2.png';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onApprove: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, onDelete, onApprove }) => {
  // Lấy ảnh đại diện (luân phiên giữa avatar1 và avatar2)
  const getAvatar = (userId: number) => {
    return userId % 2 === 0 ? avatar1 : avatar2;
  };

  // Columns cho table
  const columns = [
    {
      title: 'Ảnh đại diện',
      key: 'avatar',
      width: 100,
      render: (_: any, record: User) => (
        <Avatar
          src={getAvatar(record.id)}
          size={64}
          icon={<UserOutlined />}
          className="border-2 border-gray-200"
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'leader' ? 'red' : 'blue'}>
          {role === 'leader' ? 'Leader' : 'Staff'}
        </Tag>
      ),
      filters: [
        { text: 'Leader', value: 'leader' },
        { text: 'Staff', value: 'staff' },
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'approved',
      key: 'approved',
      render: (approved: boolean | undefined) => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      ),
      filters: [
        { text: 'Đã duyệt', value: true },
        { text: 'Chờ duyệt', value: false },
      ],
      onFilter: (value: any, record: User) => {
        if (value === true) return record.approved === true;
        if (value === false) return record.approved !== true;
        return true;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: User) => (
        <Space size="middle">
          {!record.approved && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onApprove(record.id)}
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Duyệt
            </Button>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa user"
            description="Bạn có chắc chắn muốn xóa user này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-table-wrapper">
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nhân viên`,
        }}
        className="bg-white rounded-lg shadow"
      />
    </div>
  );
};

export default UserTable;
