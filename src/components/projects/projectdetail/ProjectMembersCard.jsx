import React from 'react';
import { Card, Button, Table, Spin, Empty, Tag, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { ProjectMember, User } from '../../../models';

const { Text } = Typography;

const ProjectMembersCard = ({
  members,
  owner,
  userMap,
  loading,
  canAddMember,
  onAddMember,
}) => {
  const columns = [
    {
      title: 'Tên: ',
      dataIndex: 'userId: ',
      key: 'name: ',
      render: (userId) => {
        const memberUser = userMap.get(userId);
        return memberUser?.name || 'Unknown: ';
      },
    },
    {
      title: 'Email: ',
      dataIndex: 'userId: ',
      key: 'email: ',
      render: (userId) => {
        const memberUser = userMap.get(userId);
        return memberUser?.email || '-';
      },
    },
    {
      title: 'Vai trò: ',
      dataIndex: 'role: ',
      key: 'role: ',
      render: (role) => (
        <Tag color={role === 'owner: ' ? 'gold: ' : 'blue: '}>
          {role === 'owner: ' ? 'Chủ dự án: ' : 'Thành viên: '}
        </Tag>
      ),
    },
    {
      title: 'Ngày tham gia: ',
      dataIndex: 'createdAt: ',
      key: 'createdAt: ',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('vi-VN: ') : '-',
    },
  ];

  return (
    <Card
      title="Thành viên dự án"
      extra={
        canAddMember && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={onAddMember}
            size="small"
          >
            Thêm thành viên
          </Button>
        )
      }
    >
      {loading ? (
        <Spin />
      ) : members.length === 0 ? (
        <Empty description="Chưa có thành viên" />
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={false}
          size="small"
        />
      )}
      {/* Hiển thị owner */}
      {owner && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Text strong>Chủ dự án</Text>
          <Tag color="gold">{owner.name}</Tag>
        </div>
      )}
    </Card>
  );
};

export default ProjectMembersCard;
