import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Divider, Spin, message, Dropdown } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTasks } from "@/lib/hooks/useTasks";
import { useLogworks } from "@/lib/hooks/useLogworks";
import { usersApi, projectMembersApi, projectsApi } from "@/lib/api";
import { canAddProjectMember, isLeader } from "@/lib/utils/permissions";

import EditProjectModal from "@/components/Project/Detail/EditProjectModal.jsx";
import AddProjectMemberModal from "@/components/Project/Detail/AddProjectMemberModal.jsx";
import CreateTaskForMemberModal from "@/components/Project/Detail/CreateTaskForMemberModal.jsx";
import TaskDetailModal from "@/components/Task/TaskDetailModal.jsx";
import EditTaskModal from "@/components/Task/EditTaskModal.jsx";

import {
  ProjectDetailHeader,
  ProjectBreadcrumbs,
  ProjectTabs,
  ProjectStatusTimeline,
  ProjectStatistics,
  ProjectInfoCard,
  ProjectMembersCard,
  ProjectTasksTable,
  ProjectLogworksTable,
} from "@/components/Project/Detail";
import { useLayout } from "@/contexts/LayoutContext";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { projects, deleteProject } = useProjects();
  const { tasks, loading: tasksLoading, fetchTasks } = useTasks();
  const { logworks, loading: logworksLoading } = useLogworks();

  const projectId = id ? Number(id) : null;

  const [project, setProject] = useState(null);
  const [owner, setOwner] = useState(null);

  const [projectMembers, setProjectMembers] = useState([]);
  const [memberUsers, setMemberUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [loadingMembers, setLoadingMembers] = useState(true);

  const [openEdit, setOpenEdit] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [openEditTask, setOpenEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // 1) set project từ list projects
  useEffect(() => {
    if (!projectId) return;
    const found = (projects || []).find((p) => Number(p.id) === Number(projectId));
    setProject(found || null);
  }, [projectId, projects]);

  // 2) fetch owner
  useEffect(() => {
    const run = async () => {
      if (!project?.userId) return;
      try {
        const data = await usersApi.getUserById(project.userId);
        setOwner(data);
      } catch (e) {
        console.error("Failed to fetch owner:", e);
      }
    };
    run();
  }, [project?.userId]);

  // 3) fetch all users (để select add member)
  useEffect(() => {
    const run = async () => {
      try {
        const data = await usersApi.getUsers();
        setAllUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch users:", e);
      }
    };
    run();
  }, []);

  // 4) fetch members (tách ra callback để gọi lại sau khi add/remove)
  const fetchMembers = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoadingMembers(true);

      const membersData = await projectMembersApi.getProjectMembersByProject(projectId);
      const safeMembers = Array.isArray(membersData) ? membersData : [];
      setProjectMembers(safeMembers);

      const userIds = safeMembers.map((m) => m.userId);
      const usersData = await Promise.all(userIds.map((uid) => usersApi.getUserById(uid)));
      setMemberUsers(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error("Failed to fetch members:", e);
    } finally {
      setLoadingMembers(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 5) filter tasks of project
  const projectTasks = useMemo(() => {
    if (!projectId) return [];
    return (tasks || []).filter((t) => Number(t.projectId) === Number(projectId));
  }, [tasks, projectId]);

  // 6) logworks of project
  const projectLogworks = useMemo(() => {
    if (!projectId) return [];
    const taskIds = projectTasks.map((t) => t.id);
    return (logworks || []).filter((lw) => taskIds.includes(lw.taskId));
  }, [logworks, projectTasks, projectId]);

  // 7) userMap
  const userMap = useMemo(() => {
    const map = new Map();
    if (owner?.id != null) map.set(owner.id, owner);
    (memberUsers || []).forEach((u) => {
      if (u?.id != null) map.set(u.id, u);
    });
    return map;
  }, [owner, memberUsers]);

  // 8) statistics
  const statistics = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;
    const totalHours = projectLogworks.reduce((sum, lw) => sum + Number(lw.hours || 0), 0);

    // ✅ member table đang chứa cả owner (role=owner) => totalMembers = unique users
    const uniqueUserIds = new Set((projectMembers || []).map((m) => String(m.userId)));
    const totalMembers = uniqueUserIds.size;

    const overdueTasks = projectTasks.filter(t =>
      t.status !== "done" &&
      t.dueDate &&
      new Date(t.dueDate) < new Date()
    );

    return { totalTasks, completedTasks, totalHours, totalMembers, overdueCount: overdueTasks.length };
  }, [projectTasks, projectLogworks, projectMembers]);

  const isAtRisk = statistics.overdueCount > 0;

  // 9) permissions
  const canEdit = isLeader(user) || String(user?.id) === String(project?.userId);
  const canAddMember = canAddProjectMember(user, project?.userId);

  // ✅ Tính toán userTaskProjectIds để check fallback
  const userTaskProjectIds = useMemo(() => {
    if (!user || !projectId) return [];
    // Lấy các task của user trong project này
    const myTasksInProject = (tasks || []).filter(
      (t) => String(t.userId) === String(user.id) && Number(t.projectId) === Number(projectId)
    );
    return myTasksInProject.length > 0 ? [projectId] : [];
  }, [tasks, user, projectId]);

  // ✅ staff chỉ được xem khi là member/owner của project HOẶC có task trong project
  const isAllowed = useMemo(() => {
    if (!user) return false;
    if (user.role === "leader") return true;

    // staff: là owner
    if (String(project?.userId) === String(user.id)) return true;

    // staff: là member (từ project_members)
    const isMember = (projectMembers || []).some(
      (m) =>
        String(m.projectId) === String(projectId) &&
        String(m.userId) === String(user.id)
    );
    if (isMember) return true;

    // ✅ Fallback: staff có task trong project (dù chưa được thêm vào project_members)
    return userTaskProjectIds.includes(projectId);
  }, [user, project?.userId, projectMembers, projectId, userTaskProjectIds]);

  // ✅ guard quyền: staff không thuộc project -> toast + redirect dashboard
  useEffect(() => {
    if (!user || !projectId) return;

    if (user.role === "leader") return;

    // chờ load members xong + project đã set
    if (loadingMembers) return;

    if (!project) {
      message.error("Dự án không tồn tại hoặc bạn không có quyền");
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!isAllowed) {
      message.error("Bạn không có quyền truy cập dự án này");
      navigate("/dashboard", { replace: true });
    }
  }, [user, projectId, loadingMembers, project, isAllowed, navigate]);

  // 10) handlers
  const handleUpdatedProject = (updated) => {
    setProject(updated);
  };

  // ✅ Handler để đổi trạng thái project nhanh
  const handleStatusChange = async (newStatus) => {
    if (!projectId || !project) return;

    try {
      const updated = await projectsApi.updateProject(projectId, {
        ...project,
        status: newStatus,
      });

      setProject(updated);
      return updated;
    } catch (error) {
      console.error("Failed to update project status:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteProject(projectId);
      message.success("Xóa dự án thành công");
      navigate("/projects");
    } catch (error) {
      message.error(error?.message || "Xóa dự án thất bại");
    }
  };

  const handleAddMember = () => setOpenAddMember(true);

  const handleRemoveMember = async (memberRow) => {
    if (!memberRow?.id) return;

    // chặn xóa owner
    if (
      memberRow.role === "owner" ||
      String(memberRow.userId) === String(project?.userId)
    ) {
      message.warning("Không thể xóa chủ dự án");
      return;
    }

    try {
      await projectMembersApi.deleteProjectMember(memberRow.id);

      message.success("Đã xóa thành viên khỏi dự án");
      await fetchMembers();
    } catch (e) {
      console.error(e);
      message.error("Xóa thành viên thất bại");
    }
  };

  const handleCreateTask = () => {
    setOpenCreateTask(true);
  };

  // 11) Render
  if (loadingMembers) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;
  if (user.role !== "leader" && !isAllowed) return null;
  if (!project) return null;

  return (
    <main className="max-w-[1400px] mx-auto w-full flex flex-col gap-2 py-6 px-4 bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white">
      {isAtRisk && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <p className="text-red-800 font-bold text-base">Cảnh báo: Dự án đang bị chậm tiến độ</p>
              <p className="text-red-600 text-sm">Có {statistics.overdueCount} công việc đã quá hạn nhưng chưa hoàn thành.</p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.querySelector('.user-management-table');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border-none cursor-pointer"
          >
            Kiểm tra ngay
          </button>
        </div>
      )}

      <ProjectBreadcrumbs projectName={project.name} />

      <ProjectDetailHeader
        project={project}
        canEdit={canEdit}
        onEdit={() => setOpenEdit(true)}
        onStatusChange={handleStatusChange}
      />

      <ProjectTabs />

      {/* Stats Section */}
      <ProjectStatistics
        totalTasks={statistics.totalTasks}
        completedTasks={statistics.completedTasks}
        totalHours={statistics.totalHours}
        totalMembers={statistics.totalMembers}
      />

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 p-4">
        {/* Recent Tasks/Active Overview */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-primary/20">
          <ProjectTasksTable
            tasks={projectTasks}
            userMap={userMap}
            loading={tasksLoading}
            onCreateTask={handleCreateTask}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setOpenTaskDetail(true);
            }}
            isCompleted={project?.status === "COMPLETED"}
          />
        </div>
      </div>

      {/* Team Members Section */}
      <div className="p-4 mb-10">
        <ProjectMembersCard
          members={projectMembers}
          owner={owner}
          userMap={userMap}
          loading={loadingMembers}
          canAddMember={canAddMember}
          onAddMember={handleAddMember}
          canRemoveMember={canEdit}
          onRemoveMember={handleRemoveMember}
          currentUserId={project?.userId}
          isCompleted={project?.status === "COMPLETED"}
        />
      </div>

      <EditProjectModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        project={project}
        onUpdated={handleUpdatedProject}
      />

      <AddProjectMemberModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectId={projectId}
        users={allUsers}
        currentUserId={project?.userId}
        existingMembers={projectMembers}
        onAdded={fetchMembers}
      />

      <CreateTaskForMemberModal
        open={openCreateTask}
        onClose={() => setOpenCreateTask(false)}
        projectId={projectId}
        projectMembers={projectMembers}
        userMap={userMap}
        onCreated={fetchTasks}
      />

      <TaskDetailModal
        open={openTaskDetail}
        onCancel={() => setOpenTaskDetail(false)}
        task={selectedTask}
        projects={projects}
        logworks={logworks}
        onStatusUpdated={async (newStatus) => {
          await fetchTasks();
          setSelectedTask(prev => ({ ...prev, status: newStatus }));
        }}
        onEdit={(task) => {
          setSelectedTask(task);
          setOpenTaskDetail(false);
          setOpenEditTask(true);
        }}
        onDelete={() => {
          fetchTasks();
        }}
        // placeholder for onOpenLogwork if needed
        onOpenLogwork={() => { }}
      />

      <EditTaskModal
        open={openEditTask}
        onClose={() => setOpenEditTask(false)}
        task={selectedTask}
        projectMembers={projectMembers}
        userMap={userMap}
        onUpdated={fetchTasks}
      />
    </main>
  );
};

export default ProjectDetail;
