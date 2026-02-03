import React from "react";
import { Card, Table, Spin, Empty } from "antd";

const PAGE_SIZE = 10;

const ProjectLogworksTable = ({
  logworks = [],
  tasks = [],
  userMap = new Map(),
  loading,
}) => {
  const columns = [
    {
      title: "Công việc",
      dataIndex: "taskId",
      key: "taskId",
      render: (taskId) => {
        const task = tasks.find((t) => String(t.id) === String(taskId));
        return task?.title || `Công việc #${taskId}`;
      },
    },
    {
      title: "Người làm",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => {
        const logworkUser = userMap.get(userId);
        return logworkUser?.name || "Không xác định";
      },
    },
    {
      title: "Số giờ",
      dataIndex: "hours",
      key: "hours",
      render: (hours) => `${hours} giờ`,
    },
    {
      title: "Ghi chú",
      key: "note",
      render: (_, record) => record.note || record.description || "-",
      ellipsis: true,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
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
          pagination={{ pageSize: PAGE_SIZE }}
        />
      )}
    </Card>
  );
};

export default ProjectLogworksTable;
