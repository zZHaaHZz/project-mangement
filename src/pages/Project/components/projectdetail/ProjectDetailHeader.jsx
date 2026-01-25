import React from "react";
import { Button, Space, Typography, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ProjectDetailHeader = ({ project, canEdit, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
        className="mb-4"
      >
        Quay lại
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <Title level={2} className="mb-2">
            {project?.name}
          </Title>
          <Text type="secondary">{project?.description}</Text>
        </div>

        {canEdit && (
          <Space>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Chỉnh sửa
            </Button>

            <Popconfirm
              title="Xóa dự án"
              description="Bạn có chắc chắn muốn xóa dự án này?"
              onConfirm={onDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }} // ✅ FIX CHÍNH Ở ĐÂY
            >
              <Button icon={<DeleteOutlined />} danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
