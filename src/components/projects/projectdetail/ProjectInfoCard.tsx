import React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import { Project, User } from '../../../models';
import { STATUS_COLOR } from './constants';

const { Text } = Typography;

interface ProjectInfoCardProps {
  project: Project;
  owner: User | null;
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ project, owner }) => {
  return (
    <Card title="Thông tin dự án">
      <Space direction="vertical" size="middle" className="w-full">
        <div>
          <Text strong>Tạo bởi: </Text>
          <Text>{owner?.name || 'Unknown'}</Text>
        </div>
        <div>
          <Text strong>Email: </Text>
          <Text>{owner?.email || '-'}</Text>
        </div>
        <div>
          <Text strong>Ngày tạo: </Text>
          <Text>
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString('vi-VN')
              : '-'}
          </Text>
        </div>
        <div>
          <Text strong>Trạng thái: </Text>
          <Tag color={STATUS_COLOR[project.status]}>{project.status}</Tag>
        </div>
      </Space>
    </Card>
  );
};

export default ProjectInfoCard;

