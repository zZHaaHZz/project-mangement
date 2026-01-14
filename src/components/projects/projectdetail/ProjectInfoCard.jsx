import React from "react";
import { Card, Space, Tag, Typography } from "antd";
import { STATUS_COLOR } from "./constants";

const { Text } = Typography;

const ProjectInfoCard = ({ project, owner }) => {
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Card title="Thông tin dự án">
      <Space orientation="vertical" size="middle" className="w-full">
        <div>
          <Text strong>Tạo bởi:</Text>{" "}
          <Text>{owner?.name || "Unknown"}</Text>
        </div>

        <div>
          <Text strong>Email:</Text>{" "}
          <Text>{owner?.email || "-"}</Text>
        </div>

        <div>
          <Text strong>Ngày tạo:</Text>{" "}
          <Text>{formatDate(project?.createdAt)}</Text>
        </div>

        <div>
          <Text strong>Trạng thái:</Text>{" "}
          <Tag color={STATUS_COLOR[project?.status] || "default"}>
            {project?.status}
          </Tag>
        </div>
      </Space>
    </Card>
  );
};

export default ProjectInfoCard;
