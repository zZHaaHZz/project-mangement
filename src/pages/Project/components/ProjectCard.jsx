import React from "react";
import { Card, Tag, Avatar, Typography, Space } from "antd";
import { 
  UserOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  ArrowRightOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

const STATUS_COLOR = {
  PLANNING: "blue",
  IN_PROGRESS: "green",
  COMPLETED: "gold",
  CANCELLED: "red",
};

const STATUS_LABEL = {
  PLANNING: "Đang lên kế hoạch",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const ProjectCard = ({ project, owner }) => {
  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
  };

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'PLANNING':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'IN_PROGRESS':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'COMPLETED':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'CANCELLED':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      default:
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    }
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="h-full cursor-pointer transition-all duration-300 hover:scale-105"
      style={{ 
        height: "100%",
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: '20px' }}
      cover={
        <div 
          style={{ 
            height: '8px',
            background: getStatusGradient(project.status),
            margin: 0
          }}
        />
      }
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-3">
            <Text strong className="text-xl" style={{ 
              color: '#1a1a1a',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {project.name}
            </Text>
            <Tag 
              color={STATUS_COLOR[project.status] || "default"}
              style={{ 
                borderRadius: '12px',
                padding: '4px 12px',
                marginLeft: '8px',
                flexShrink: 0
              }}
            >
              {STATUS_LABEL[project.status] || project.status}
            </Tag>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-4 flex-1">
            <Paragraph 
              ellipsis={{ rows: 2, expandable: false }}
              style={{ 
                margin: 0,
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {project.description}
            </Paragraph>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex items-center gap-2">
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                src={owner?.avatar}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Text type="secondary" className="text-sm">
                <UserOutlined className="mr-1" />
                {owner?.name || "Unknown"}
              </Text>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
              <Text type="secondary" className="text-sm">
                {formatDate(project.createdAt)}
              </Text>
            </div>
          </Space>

          <div className="mt-3 flex items-center justify-end text-blue-600 hover:text-blue-700">
            <Text className="text-sm font-medium">Xem chi tiết</Text>
            <ArrowRightOutlined className="ml-1" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
