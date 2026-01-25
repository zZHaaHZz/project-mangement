import React from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, ProjectOutlined } from '@ant-design/icons';
import { User } from '@/models';
import { canCreateProject } from '@/lib/utils/permissions';

const { Search } = Input;
const { Title, Text } = Typography;

const ProjectsHeader = ({
  user,
  onCreateProject,
  onSearch,
  searchValue = ''
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <Title level={2} className="mb-2">
            <Space>
              <ProjectOutlined style={{ color: '#1890ff' }} />
              <span>Danh sách dự án</span>
            </Space>
          </Title>
          <Text type="secondary">Quản lý và theo dõi tất cả các dự án của bạn</Text>
        </div>

        {canCreateProject(user) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateProject}
            size="large"
            style={{
              height: '48px',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 6px -1px rgba(24, 144, 255, 0.3)'
            }}
          >
            Tạo dự án mới
          </Button>
        )}
      </div>

      <div className="max-w-md">
        <Search
          placeholder="Tìm kiếm dự án theo tên hoặc mô tả"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          onChange={(e) => onSearch?.(e.target.value)}
          value={searchValue}
          className="w-full"
          style={{ borderRadius: '10px' }}
        />
      </div>
    </div>
  );
};

export default ProjectsHeader;

