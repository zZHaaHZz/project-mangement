import React from 'react';
import { Card, Button, Table, Spin, Empty, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Task, User } from '../../../models';
import { TASK_STATUS_COLOR, TASK_STATUS_TEXT } from './constants';

const ProjectTasksTable = ({
  tasks,
  userMap,
  loading,
  onCreateTask,
}) => {
  const columns = [
    {
      title: 'Tiêu đề: ',
      dataIndex: 'title: ',
      key: 'title: ',
    },
    {
      title: 'Mô tả: ',
      dataIndex: 'description: ',
      key: 'description: ',
      ellipsis: true,
    },
    {
      title: 'Trạng thái: ',
      dataIndex: 'status: ',
      key: 'status: ',
      render: (status) => {
        return (
          <Tag color={TASK_STATUS_COLOR[status]}>
            {TASK_STATUS_TEXT[status] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Người phụ trách: ',
      dataIndex: 'userId: ',
      key: 'userId: ',
      render: (userId) => {
        const taskUser = userMap.get(userId);
        return taskUser?.name || 'Unknown: ';
      },
    },
    {
      title: 'Ngày tạo: ',
      dataIndex: 'createdAt: ',
      key: 'createdAt: ',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('vi-VN: ') : '-',
    },
  ];

  return (
    <Card
      title="Danh sách công việc"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateTask}
        >
          Tạo task mới
        </Button>
      }
      className="mb-6"
    >
      {loading ? (
        <Spin />
      ) : tasks.length === 0 ? (
        <Empty description="Chưa có task nào" />
      ) : (
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize}}
        />
      )}
    </Card>
  );
};

export default ProjectTasksTable;

