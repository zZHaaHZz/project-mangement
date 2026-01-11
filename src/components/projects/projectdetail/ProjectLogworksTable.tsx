import React from 'react';
import { Card, Table, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Logwork, Task, User } from '../../../models';

interface ProjectLogworksTableProps {
  logworks: Logwork[];
  tasks: Task[];
  userMap: Map<number, User>;
  loading: boolean;
}

const ProjectLogworksTable: React.FC<ProjectLogworksTableProps> = ({
  logworks,
  tasks,
  userMap,
  loading,
}) => {
  const columns: ColumnsType<Logwork> = [
    {
      title: 'Task',
      dataIndex: 'taskId',
      key: 'taskId',
      render: (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        return task?.title || `Task #${taskId}`;
      },
    },
    {
      title: 'Người làm',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: number) => {
        const logworkUser = userMap.get(userId);
        return logworkUser?.name || 'Unknown';
      },
    },
    {
      title: 'Số giờ',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => `${hours} giờ`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
  ];

  return (
    <Card title="Lịch sử làm việc" className="mb-6">
      {loading ? (
        <Spin />
      ) : logworks.length === 0 ? (
        <Empty description="Chưa có logwork nào" />
      ) : (
        <Table
          columns={columns}
          dataSource={logworks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default ProjectLogworksTable;

