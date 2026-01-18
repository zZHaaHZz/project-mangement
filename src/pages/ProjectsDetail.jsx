import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Divider, Spin, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useProjects } from "../lib/hooks/useProjects";
import { useTasks } from "../lib/hooks/useTasks";
import { useLogworks } from "../lib/hooks/useLogworks";
import { usersApi, projectMembersApi } from "../lib/api";
import { canAddProjectMember, isLeader } from "../lib/utils/permissions";

import EditProjectModal from "../components/projects/projectdetail/EditProjectModal";
import AddProjectMemberModal from "../components/projects/projectdetail/AddProjectMemberModal";
import CreateTaskForMemberModal from "../components/projects/projectdetail/CreateTaskForMemberModal";

import {
  ProjectDetailHeader,
  ProjectStatusTimeline,
  ProjectStatistics,
  ProjectInfoCard,
  ProjectMembersCard,
  ProjectTasksTable,
  ProjectLogworksTable,
} from "../components/projects/projectdetail";

const ProjectsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { projects, deleteProject } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
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
        const data = await usersApi.getUser(project.userId);
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
      const usersData = await Promise.all(userIds.map((uid) => usersApi.getUser(uid)));
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

    return { totalTasks, completedTasks, totalHours, totalMembers };
  }, [projectTasks, projectLogworks, projectMembers]);

  // 9) permissions
  const canEdit = isLeader(user) || String(user?.id) === String(project?.userId);
  const canAddMember = canAddProjectMember(user, project?.userId);

  // ✅ staff chỉ được xem khi là member/owner của project
  const isAllowed = useMemo(() => {
    if (!user) return false;
    if (user.role === "leader") return true;

    // staff: là owner
    if (String(project?.userId) === String(user.id)) return true;

    // staff: là member
    return (projectMembers || []).some(
      (m) =>
        String(m.projectId) === String(projectId) &&
        String(m.userId) === String(user.id)
    );
  }, [user, project?.userId, projectMembers, projectId]);

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
  const handleEdit = () => setOpenEdit(true);

  const handleUpdatedProject = (updated) => {
    setProject(updated);
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
      const res = await fetch(`http://localhost:3001/project_members/${memberRow.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

  // ✅ render
  if (loadingMembers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // staff không quyền -> useEffect sẽ navigate, ở đây return null để không flash UI
  if (!user) return null;
  if (user.role !== "leader" && !isAllowed) return null;

  // project null (sau load) -> cũng return null (đã toast+redirect ở effect)
  if (!project) return null;

  return (
    <div className="p-6 w-full">
      <ProjectDetailHeader
        project={project}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditProjectModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        project={project}
        onUpdated={handleUpdatedProject}
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
            loading={loadingMembers}
            canAddMember={canAddMember}
            onAddMember={handleAddMember}
            canRemoveMember={canEdit}
            onRemoveMember={handleRemoveMember}
            currentUserId={project?.userId}
          />
        </Col>
      </Row>

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
        onCreated={() => {
          // TODO: nếu useTasks có refetch thì gọi ở đây
        }}
      />

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
