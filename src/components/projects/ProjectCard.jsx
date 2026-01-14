import React from "react";
import { Card, Tag } from "antd";
import Link from "antd/es/typography/Link";

const STATUS_COLOR = {
  PLANNING: "blue",
  IN_PROGRESS: "green",
  COMPLETED: "gold",
  CANCELLED: "red",
};

const ProjectCard = ({ project, owner }) => {
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card
        hoverable
        style={{ height: "100%" }}
        title={<span className="text-2xl">{project.name}</span>}
        extra={
          <Tag color={STATUS_COLOR[project.status] || "default"}>
            {project.status}
          </Tag>
        }
      >
        <p className="text-2xl mb-2">
          <b>Tạo bởi:</b> {owner?.name || "Unknown"}
        </p>

        <p className="text-2xl mb-2 line-clamp-2">
          <b>Mô tả:</b> {project.description || "-"}
        </p>

        <p className="text-2xl mb-2">
          <b>Trạng thái:</b> {project.status}
        </p>

        <p className="text-2xl">
          <b>Ngày tạo:</b> {formatDate(project.createdAt)}
        </p>
      </Card>
    </Link>
  );
};

export default ProjectCard;
