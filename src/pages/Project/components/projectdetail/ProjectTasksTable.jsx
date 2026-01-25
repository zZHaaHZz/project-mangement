import React, { useState, useMemo } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Switch, Space, Typography } from "antd";
import { PlusOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { TASK_STATUS_COLOR, TASK_STATUS_TEXT } from "./constants";

const { Text } = Typography;

const PAGE_SIZE = 10;

const ProjectTasksTable = ({
  tasks = [],
  userMap = new Map(),
  loading,
  onCreateTask,
}) => {
  // ✅ Filter state cho completed tasks
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  
  // ✅ Filter tasks
  const filteredTasks = useMemo(() => {
    if (showCompletedTasks) return tasks;
    return tasks.filter((t) => t.status !== "done");
  }, [tasks, showCompletedTasks]);
  
  // ✅ Đếm số task đã done
  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "done").length;
  }, [tasks]);
  
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Text
          style={{
            textDecoration: record.status === "done" ? "line-through" : "none",
            color: record.status === "done" ? "#8c8c8c" : undefined,
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag 
          color={TASK_STATUS_COLOR[status]}
          icon={status === "done" ? <CheckCircleOutlined /> : null}
        >
          {TASK_STATUS_TEXT[status] || status}
        </Tag>
      ),
    },
    {
      title: "Người phụ trách",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => {
        const taskUser = userMap.get(userId);
        return taskUser?.name || "Unknown";
      },
    },
    {
      title: "Hạn chót",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Ước tính (h)",
      dataIndex: "estimation",
      key: "estimation",
      render: (val) => (val ? `${val}h` : "-"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
  ];

  return (
    <Card
      title="Danh sách công việc"
      extra={
        <Space>
          {completedCount > 0 && (
            <Text type="secondary" className="text-sm">
              {completedCount} task đã hoàn thành
            </Text>
          )}
          <Space>
            <Text className="text-sm">Hiển thị task đã hoàn thành:</Text>
            <Switch
              checked={showCompletedTasks}
              onChange={setShowCompletedTasks}
              checkedChildren="Có"
              unCheckedChildren="Không"
              size="small"
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateTask}>
            Tạo task mới
          </Button>
        </Space>
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
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{ pageSize: PAGE_SIZE }}
          rowClassName={(record) => 
            record.status === "done" ? "completed-task-row" : ""
          }
        />
      )}
    </Card>
  );
};

export default ProjectTasksTable;
