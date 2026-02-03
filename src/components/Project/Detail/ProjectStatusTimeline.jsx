import React, { useMemo } from "react";
import { Card, Tag, Timeline, Typography, Dropdown, Button, Space, message } from "antd";
import { DownOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { STATUS_COLOR } from "./constants";

const { Title } = Typography;

const ProjectStatusTimeline = ({ project, canEdit, onStatusChange }) => {
  const timelineItems = useMemo(() => {
    if (!project?.status) return [];

    const statuses = ["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    const statusLabels = {
      PLANNING: "Dự kiến",
      IN_PROGRESS: "Đang triển khai",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
    };
    const currentStatus = project.status;

    return statuses.map((status) => ({
      content: statusLabels[status] || status.replace("_", " "),
      color: status === currentStatus ? STATUS_COLOR[status] : "gray",
    }));
  }, [project?.status]);

  const statusOptions = [
    { value: "PLANNING", label: "Đang lên kế hoạch", color: "blue" },
    { value: "IN_PROGRESS", label: "Đang thực hiện", color: "green" },
    { value: "COMPLETED", label: "Hoàn thành", color: "gold" },
    { value: "CANCELLED", label: "Đã hủy", color: "red" },
  ];

  const handleStatusChange = async (newStatus) => {
    if (!onStatusChange) return;

    try {
      await onStatusChange(newStatus);
      message.success("Đổi trạng thái dự án thành công");
    } catch (error) {
      message.error("Đổi trạng thái dự án thất bại");
    }
  };

  const currentStatusLabel = statusOptions.find(
    (opt) => opt.value === project?.status
  )?.label || project?.status;

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>
          Trạng thái dự án
        </Title>

        {canEdit && (
          <Dropdown
            menu={{
              items: statusOptions.map((opt) => ({
                key: opt.value,
                label: opt.label,
                icon: opt.value === project?.status ? <CheckCircleOutlined /> : null,
                disabled: opt.value === project?.status,
              })),
              onClick: ({ key }) => handleStatusChange(key),
            }}
            trigger={["click"]}
          >
            <Button type="primary" icon={<DownOutlined />}>
              Đổi trạng thái
            </Button>
          </Dropdown>
        )}
      </div>

      {/* ✅ FIX deprecated mode */}
      <Timeline items={timelineItems} mode="start" />

      <div className="mt-4">
        <Space>
          <Tag
            color={STATUS_COLOR[project?.status]}
            style={{ fontSize: "14px", padding: "4px 12px" }}
          >
            Trạng thái hiện tại: {currentStatusLabel}
          </Tag>
        </Space>
      </div>
    </Card>
  );
};

export default ProjectStatusTimeline;
