import React from 'react';
import { Button, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { User } from '../../models';
import { canCreateProject } from '../../lib/utils/permissions';

const { Search } = Input;

interface ProjectsHeaderProps {
  user: User | null;
  onCreateProject?: () => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ 
  user, 
  onCreateProject, 
  onSearch,
  searchValue = ''
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách dự án</h1>
        <div className="max-w-full   flex items-center gap-2">
        <Search
          placeholder="Tìm kiếm dự án theo tên hoặc mô tả"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          onChange={(e) => onSearch?.(e.target.value)}
          value={searchValue}
          className="w-full"
        />
      
        {canCreateProject(user) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateProject}
            size="large"
          >
            Tạo dự án mới
          </Button>
        )}
      </div>
      </div>
    
    </div>
  );
};

export default ProjectsHeader;

