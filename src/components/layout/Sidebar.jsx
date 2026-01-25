import { useState, useEffect, useMemo } from "react";
import { Menu, Badge } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { useProjects } from "@/lib/hooks/useProjects";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjectMembers } from "@/lib/hooks/useProjectMembers";
import { useAuth } from "@/contexts/AuthContext";
import { canManageStaff, isProjectMember } from "@/lib/utils/permissions";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const projectsHook = useProjects();
  const tasksHook = useTasks();
  const membersHook = useProjectMembers();

  const projects = projectsHook?.projects ?? [];
  const tasks = tasksHook?.tasks ?? [];
  const members = membersHook?.members ?? [];

  const projectsLoading = projectsHook?.loading ?? projectsHook?.projectsLoading ?? false;
  const tasksLoading = tasksHook?.loading ?? tasksHook?.tasksLoading ?? false;
  const membersLoading = membersHook?.loading ?? membersHook?.membersLoading ?? false;

  const { user } = useAuth();

  const myTasksCount = useMemo(() => {
    if (!user) return 0;
    return tasks.filter((t) => String(t.userId) === String(user.id)).length;
  }, [tasks, user]);

  const userProjectIds = useMemo(() => {
    if (!user) return [];
    return members
      .filter((m) => String(m.userId) === String(user.id))
      .map((m) => m.projectId);
  }, [members, user]);

  const userTaskProjectIds = useMemo(() => {
    if (!user) return [];
    const myTasks = tasks.filter((t) => String(t.userId) === String(user.id));
    return Array.from(new Set(myTasks.map((t) => t.projectId)));
  }, [tasks, user]);

  const activeProjects = useMemo(() => {
    const statusFiltered = projects.filter(
      (p) => p?.status === "PLANNING" || p?.status === "IN_PROGRESS"
    );

    if (!user) return [];
    if (user.role === "leader") return statusFiltered;

    return statusFiltered.filter((project) =>
      isProjectMember(user, project.id, project.userId, userProjectIds, userTaskProjectIds)
    );
  }, [projects, user, userProjectIds, userTaskProjectIds]);

  const projectMenuItems = useMemo(() => {
    const statusLabels = {
      PLANNING: "Planning",
      IN_PROGRESS: "Đang làm",
    };

    return activeProjects.map((project) => ({
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
        { key: `/projects/${project.id}/tasks`, icon: <FileTextOutlined />, label: "Tasks" },
        { key: `/projects/${project.id}/logworks`, icon: <ClockCircleOutlined />, label: "Logworks" },
        { key: `/projects/${project.id}/analytics`, icon: <BarChartOutlined />, label: "Analytics" },
        { key: `/projects/${project.id}/calendar`, icon: <CalendarOutlined />, label: "Calendar" },
        { key: `/projects/${project.id}/settings`, icon: <SettingOutlined />, label: "Settings" },
      ],
    }));
  }, [activeProjects]);

  const menuItems = useMemo(() => {
    const items = [
      { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "/projects", icon: <ProjectOutlined />, label: "Projects" },

      // ✅ Menu My Tasks riêng, không children
      {
        key: "/my-tasks",
        icon: <CheckSquareOutlined />,
        label: (
          <div className="flex items-center justify-between">
            <span>
              {canManageStaff(user) ? "Task" : "My Task"}
            </span>

            <Badge count={myTasksCount} showZero style={{ backgroundColor: "#52c41a" }} />
          </div>
        ),
      },
    ];

    if (canManageStaff(user)) {
      items.push({ key: "/users", icon: <ProjectOutlined />, label: "Quản lý nhân viên" });
    }

    items.push({ key: "/settings", icon: <SettingOutlined />, label: "Settings" });

    // items.push({ type: "group", label: "PROJECTS", children: projectMenuItems });

    return items;
  }, [user, myTasksCount, projectMenuItems]);

  const handleMenuClick = ({ key }) => {
    if (typeof key === "string" && key.startsWith("/")) {
      navigate(key);
    }
  };

  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    return [path === "/" ? "/dashboard" : path];
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;

    // ✅ /my-tasks thì không auto mở project submenu
    if (path === "/my-tasks") return;

    const match = path.match(/^\/projects\/([^/]+)/);
    if (!match) return;

    const projectId = match[1];
    setOpenKeys((prev) => {
      const projectKey = `project-${projectId}`;
      if (!prev.includes(projectKey)) return [...prev, projectKey];
      return prev;
    });
  }, [location.pathname]);

  return (
    <aside className="bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0 shadow-lg" style={{ width: '250px' }}>
      {projectsLoading || tasksLoading || membersLoading ? (
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
          className="flex-1 border-r-0 overflow-y-auto pt-4"
          style={{ maxHeight: "100%", background: 'transparent' }}
        />
      )}
    </aside>
  );
};

export default Sidebar;
