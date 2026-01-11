import React from 'react';
import { Card, Button, Table, Spin, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { Task, User } from '../../../models';
import { TASK_STATUS_COLOR, TASK_STATUS_TEXT } from './constants';

interface ProjectTasksTableProps {
  tasks: Task[];
  userMap: Map<number, User>;
  loading: boolean;
  onCreateTask: () => void;
}

const ProjectTasksTable: React.FC<ProjectTasksTableProps> = ({
  tasks,
  userMap,
  loading,
  onCreateTask,
}) => {
  const columns: ColumnsType<Task> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return (
          <Tag color={TASK_STATUS_COLOR[status]}>
            {TASK_STATUS_TEXT[status] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: number) => {
        const taskUser = userMap.get(userId);
        return taskUser?.name || 'Unknown';
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : '-',
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
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default ProjectTasksTable;

