import React from 'react';
import { Row, Col } from 'antd';
import { Project, User } from '../../models';
import ProjectCard from './ProjectCard';

const ProjectsGrid = ({ projects, userMap }) => {
  return (
    <Row gutter={[16, 16]}>
      {projects.map((project) => {
        const owner = userMap.get(project.userId);
        return (
          <Col key={project.id} xs={24} sm={12} md={12} lg={6} xl={6}>
            <ProjectCard project={project} owner={owner} />
          </Col>
        );
      })}
    </Row>
  );
};

export default ProjectsGrid;

