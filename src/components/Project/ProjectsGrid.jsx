import React from 'react';
import ProjectCard from './ProjectCard.jsx';

const ProjectsGrid = ({ projects, userMap }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
                const owner = userMap.get(project.userId);
                return (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        owner={owner}
                        progress={project.progress || 0}
                        isAtRisk={project.isAtRisk || false}
                        overdueCount={project.overdueCount || 0}
                    />
                );
            })}
        </div>
    );
};

export default ProjectsGrid;
