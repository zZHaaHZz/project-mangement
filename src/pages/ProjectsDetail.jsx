import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Divider, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../lib/hooks/useProjects';
import { useTasks } from '../lib/hooks/useTasks';
import { useLogworks } from '../lib/hooks/useLogworks';
import { usersApi, projectMembersApi } from '../lib/api';
import { canAddProjectMember, isLeader } from '../lib/utils/permissions';
import { Project, Task, Logwork, User, ProjectMember } from '../models';

// Import components từ projectdetail folder
import {
  ProjectDetailHeader,
  ProjectStatusTimeline,
  ProjectStatistics,
  ProjectInfoCard,
  ProjectMembersCard,
  ProjectTasksTable,
  ProjectLogworksTable,
} from '../components/projects/projectdetail';

const ProjectsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, deleteProject } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { logworks, loading: logworksLoading } = useLogworks();

  const [project, setProject] = useState(null);
  const [owner, setOwner] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [memberUsers, setMemberUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const projectId = id ? parseInt(id) : null;

  // Lấy thông tin dự án
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const foundProject = projects.find((p) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      }
    }
  }, [projectId, projects]);

  // Lấy thông tin owner
  useEffect(() => {
    const fetchOwner = async () => {
      if (project?.userId) {
        try {
          const ownerData = await usersApi.getUser(project.userId);
          setOwner(ownerData);
        } catch (error) {
          console.error('Failed to fetch owner:', error);
        }
      }
    };
    fetchOwner();
  }, [project]);

  // Lấy danh sách thành viên
  useEffect(() => {
    const fetchMembers = async () => {
      if (projectId) {
        try {
          setLoading(true);
          const membersData = await projectMembersApi.getProjectMembersByProject(projectId);
          setProjectMembers(membersData);

          // Lấy thông tin user cho từng member
          const userIds = membersData.map((m) => m.userId);
          const usersData = await Promise.all(
            userIds.map((userId) => usersApi.getUser(userId))
          );
          setMemberUsers(usersData);
        } catch (error) {
          console.error('Failed to fetch members:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMembers();
  }, [projectId]);

  // Lọc tasks theo project
  const projectTasks = useMemo(() => {
    if (!projectId) return [];
    return tasks.filter((task) => task.projectId === projectId);
  }, [tasks, projectId]);

  // Lọc logworks theo project (thông qua tasks)
  const projectLogworks = useMemo(() => {
    if (!projectId) return [];
    const taskIds = projectTasks.map((task) => task.id);
    return logworks.filter((logwork) => taskIds.includes(logwork.taskId));
  }, [logworks, projectTasks, projectId]);

  // Tạo user map để tra cứu nhanh
  const userMap = useMemo(() => {
    const map = new Map();
    if (owner) map.set(owner.id, owner);
    memberUsers.forEach((u) => map.set(u.id, u));
    return map;
  }, [owner, memberUsers]);

  // Thống kê
  const statistics = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'done: ').length;
    const totalHours = projectLogworks.reduce((sum, lw) => sum + lw.hours, 0);
    const totalMembers = projectMembers.length + 1; // +1 cho owner

    return {
      totalTasks,
      completedTasks,
      totalHours,
      totalMembers,
    };
  }, [projectTasks, projectLogworks, projectMembers]);

  // Handlers
  const handleEdit = () => {
    // TODO: Mở modal chỉnh sửa dự án
    message.info('Tính năng chỉnh sửa đang được phát triển: ');
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteProject(projectId);
      message.success('Xóa dự án thành công: ');
      navigate('/projects: ');
    } catch (error) {
      message.error(error.message || 'Xóa dự án thất bại: ');
    }
  };

  const handleAddMember = () => {
    // TODO: Mở modal thêm thành viên
    message.info('Tính năng thêm thành viên đang được phát triển: ');
  };

  const handleCreateTask = () => {
    // TODO: Mở modal tạo task
    message.info('Tính năng tạo task đang được phát triển');
  };

  if (loading || !project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const canEdit = isLeader(user) || user?.id === project.userId;
  const canAddMember = canAddProjectMember(user, project.userId);

  return (
    <div className="p-6 w-full">
      <ProjectDetailHeader
        project={project}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProjectStatusTimeline project={project} />

      <ProjectStatistics
        totalTasks={statistics.totalTasks}
        completedTasks={statistics.completedTasks}
        totalHours={statistics.totalHours}
        totalMembers={statistics.totalMembers}
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <ProjectInfoCard project={project} owner={owner} />
        </Col>
        <Col xs={24} lg={12}>
          <ProjectMembersCard
            members={projectMembers}
            owner={owner}
            userMap={userMap}
            loading={loading}
            canAddMember={canAddMember}
            onAddMember={handleAddMember}
          />
        </Col>
      </Row>

      <Divider />

      <ProjectTasksTable
        tasks={projectTasks}
        userMap={userMap}
        loading={tasksLoading}
        onCreateTask={handleCreateTask}
      />

      <ProjectLogworksTable
        logworks={projectLogworks}
        tasks={projectTasks}
        userMap={userMap}
        loading={logworksLoading}
      />
    </div>
  );
};

export default ProjectsDetail;
