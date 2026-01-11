import { useState, useEffect, useMemo } from 'react';
import { Menu, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import { useProjects } from '../../lib/hooks/useProjects';
import { useTasks } from '../../lib/hooks/useTasks';
import { useProjectMembers } from '../../lib/hooks/useProjectMembers';
import { useAuth } from '../../contexts/AuthContext';
import type { Project, Task } from '../../models';
import { canManageStaff, isProjectMember } from '../../lib/utils/permissions';

type MenuItem = Required<MenuProps>['items'][number];

const Siderbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // ✅ an toàn với nhiều kiểu return khác nhau của hook
  const projectsHook: any = useProjects();
  const tasksHook: any = useTasks();
  const membersHook: any = useProjectMembers();

  const projects: Project[] = projectsHook?.projects ?? [];
  const tasks: Task[] = tasksHook?.tasks ?? [];
  const members = membersHook?.members ?? [];

  const projectsLoading: boolean = projectsHook?.loading ?? projectsHook?.projectsLoading ?? false;
  const tasksLoading: boolean = tasksHook?.loading ?? tasksHook?.tasksLoading ?? false;
  const membersLoading: boolean = membersHook?.loading ?? membersHook?.membersLoading ?? false;

  const { user } = useAuth();

  // ✅ Lấy tasks của current user
  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((task) => task.userId === user.id);
  }, [tasks, user]);

  // ✅ projectIds user tham gia (project_members)
  const userProjectIds = useMemo(() => {
    if (!user) return [];
    return members
      .filter((m: any) => m.userId === user.id)
      .map((m: any) => m.projectId);
  }, [members, user]);

  // ✅ fallback: projectIds user có task
  const userTaskProjectIds = useMemo(() => {
    if (!user) return [];
    return Array.from(new Set(myTasks.map((t) => t.projectId)));
  }, [myTasks, user]);

  // ✅ FIX LỖI Ở ĐÂY: projects luôn là [] nên filter không bao giờ crash
  // ✅ Đồng thời không còn bất kỳ logic company nào
  const activeProjects = useMemo(() => {
    const statusFiltered = (projects ?? []).filter((project: Project) =>
      project?.status === 'PLANNING' || project?.status === 'IN_PROGRESS'
    );

    if (!user) return [];

    if (user.role === 'leader') return statusFiltered;

    return statusFiltered.filter((project: Project) =>
      isProjectMember(
        user,
        project.id,
        project.userId,
        userProjectIds,
        userTaskProjectIds
      )
    );
  }, [projects, user, userProjectIds, userTaskProjectIds]);

  const projectMenuItems = useMemo<MenuItem[]>(() => {
    const statusLabels: Record<string, string> = {
      PLANNING: 'Planning',
      IN_PROGRESS: 'Đang làm',
    };

    return activeProjects.map((project: Project) => ({
      key: `project-${project.id}`,
      icon: <ProjectOutlined />,
      label: (
        <div className="flex items-center justify-between">
          <span>{project.name}</span>
          <span className="text-lg text-gray-500 ml-2 pr-10">
            {statusLabels[project.status] || project.status}
          </span>
        </div>
      ),
      children: [
        { key: `/projects/${project.id}/tasks`, icon: <FileTextOutlined />, label: 'Tasks' },
        { key: `/projects/${project.id}/logworks`, icon: <ClockCircleOutlined />, label: 'Logworks' },
        { key: `/projects/${project.id}/analytics`, icon: <BarChartOutlined />, label: 'Analytics' },
        { key: `/projects/${project.id}/calendar`, icon: <CalendarOutlined />, label: 'Calendar' },
        { key: `/projects/${project.id}/settings`, icon: <SettingOutlined />, label: 'Settings' },
      ],
    }));
  }, [activeProjects]);

  const myTasksMenuItems = useMemo<MenuItem[]>(() => {
    return myTasks.map((task: Task) => ({
      key: `task-${task.id}`,
      label: (
        <div className="flex flex-row items-center justify-between">
          <span>{task.title}</span>
          <span className="text-xl text-gray-500">{task.status}</span>
        </div>
      ),
      icon: (
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            task.status === 'done'
              ? 'bg-green-500'
              : task.status === 'in-progress'
              ? 'bg-yellow-500'
              : 'bg-gray-400'
          }`}
        />
      ),
    }));
  }, [myTasks]);

  const mainMenuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/projects', icon: <ProjectOutlined />, label: 'Projects' },
    ];

    if (canManageStaff(user)) {
      items.push({ key: '/users', icon: <TeamOutlined />, label: 'Quản lý nhân viên' });
    }

    items.push({ key: '/settings', icon: <SettingOutlined />, label: 'Settings' });
    return items;
  }, [user]);

  const myTasksSection: MenuItem = {
    key: 'my-tasks',
    icon: <CheckSquareOutlined />,
    label: (
      <div className="flex flex-row items-center justify-between">
        <span>My Tasks</span>
        <Badge count={myTasks.length} showZero style={{ backgroundColor: '#52c41a' }} />
      </div>
    ),
    children: myTasksMenuItems.length > 0 ? myTasksMenuItems : undefined,
  };

  const menuItems: MenuItem[] = [
    ...mainMenuItems,
    myTasksSection,
    { type: 'group' as const, label: 'PROJECTS', children: projectMenuItems },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
      return;
    }

    if (key.startsWith('task-')) {
      const taskId = key.replace('task-', '');

      // ✅ hỗ trợ task.id là number hoặc string
      const task = myTasks.find((t) => String(t.id) === String(taskId));
      if (task) navigate(`/projects/${task.projectId}/tasks`);
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;

    // ✅ nếu id không phải số (vd uuid/string) thì dùng regex thoáng hơn
    if (path.match(/^\/projects\/[^/]+\//)) return [path];
    if (path === '/projects') return ['/projects'];

    return [path || '/dashboard'];
  };

  const selectedKeys = getSelectedKeys();

  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/([^/]+)/); // ✅ không ép \d+
    if (!match) return;

    const projectId = match[1];
    setOpenKeys((prev) => {
      const projectKey = `project-${projectId}`;
      if (!prev.includes(projectKey)) return [...prev, projectKey, 'my-tasks'];
      return prev;
    });
  }, [location.pathname]);

  return (
    <aside className="w-90 bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0">
      {(projectsLoading || tasksLoading || membersLoading) ? (
        <div className="flex items-center justify-center h-full text-3xl">
          <span>Đang tải...</span>
        </div>
      ) : (
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={setOpenKeys}
          className="flex-1 border-r-0 overflow-y-auto"
          style={{ maxHeight: '100%' }}
        />
      )}
    </aside>
  );
};

export default Siderbar;
