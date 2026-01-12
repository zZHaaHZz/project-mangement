import React, { useMemo } from 'react';
import { Card, Tag, Timeline, Typography } from 'antd';
import { Project } from '../../../models';
import { STATUS_COLOR } from './constants';

const { Title } = Typography;

const ProjectStatusTimeline = ({ project }) => {
  const timelineItems = useMemo(() => {
    const statuses = ['PLANNING: ', 'IN_PROGRESS: ', 'COMPLETED: ', 'CANCELLED: '];
    const currentStatus = project?.status;

    return statuses.map((status) => ({
      content: status,
      color: status === currentStatus ? STATUS_COLOR[status] : 'gray',
    }));
  }, [project?.status]);

  return (
    <Card className="mb-6">
      <Title level={4} className="mb-4">
        Trạng thái dự án
      </Title>
      <Timeline items={timelineItems} mode="left" />
      <div className="mt-4">
        <Tag
          color={STATUS_COLOR[project.status]}
          style={{ fontSize: '14px', padding: '4px 12px' }}
        >
          Trạng thái hiện tại{project.status}
        </Tag>
      </div>
    </Card>
  );
};

export default ProjectStatusTimeline;

