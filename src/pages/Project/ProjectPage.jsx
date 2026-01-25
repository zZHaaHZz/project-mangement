import React, { useEffect, useMemo, useState } from "react";
import { message } from "antd";

import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectMembers } from "@/lib/hooks/useProjectMembers";
import { useTasks } from "@/lib/hooks/useTasks";
import { isProjectMember } from "@/lib/utils/permissions";
import { apiClient } from "@/lib/api";

import ProjectsHeader from "@/pages/Project/components/ProjectsHeader.jsx";
import ProjectsGrid from "@/pages/Project/components/ProjectsGrid.jsx";
import ProjectsPagination from "@/pages/Project/components/ProjectsPagination.jsx";
import CreateProjectModal from "@/pages/Project/components/CreateProjectModal.jsx";

const ProjectPage = () => {
  const { user } = useAuth();

  const projectsHook = useProjects();
  const projects = projectsHook?.projects ?? [];
  const projectsLoading = projectsHook?.projectsLoading ?? projectsHook?.loading ?? false;

  const { members = [] } = useProjectMembers();
  const { tasks = [] } = useTasks();

  const [openCreate, setOpenCreate] = useState(false);

  // ✅ users lấy từ DB bằng apiClient (giống UserPage)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const [projectsLocal, setProjectsLocal] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 12;

  // sync local projects
  useEffect(() => {
    setProjectsLocal(projects);
  }, [projects]);

  // ✅ fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");
      const data = await apiClient.getUsers(); // ✅
      setUsers(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) {
      console.error(e);
      setError(e?.message ?? "Không thể tải danh sách users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const userProjectIds = useMemo(() => {
    if (!user) return [];
    return members
      .filter((m) => String(m.userId) === String(user.id))
      .map((m) => m.projectId);
  }, [members, user]);

  // ✅ Tính toán userTaskProjectIds để check fallback (user có task trong project)
  const userTaskProjectIds = useMemo(() => {
    if (!user) return [];
    const myTasks = tasks.filter((t) => String(t.userId) === String(user.id));
    return Array.from(new Set(myTasks.map((t) => t.projectId)));
  }, [tasks, user]);

  const filteredProjects = useMemo(() => {
    if (!user) return [];

    if (user.role === "leader") return projectsLocal;

    // ✅ Sử dụng cả userProjectIds và userTaskProjectIds để check quyền
    return projectsLocal.filter((project) =>
      isProjectMember(user, project.id, project.userId, userProjectIds, userTaskProjectIds)
    );
  }, [projectsLocal, user, userProjectIds, userTaskProjectIds]);

  const visibleProjects = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return filteredProjects;

    return filteredProjects.filter((p) => {
      const nameMatch = (p.name ?? "").toLowerCase().includes(q);
      const descMatch = (p.description ?? "").toLowerCase().includes(q);
      return nameMatch || descMatch;
    });
  }, [filteredProjects, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [visibleProjects.length]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return visibleProjects.slice(startIndex, startIndex + pageSize);
  }, [visibleProjects, currentPage]);

  const handleCreateProject = () => {
    if (!user?.id) {
      message.error("Bạn chưa đăng nhập");
      return;
    }
    setOpenCreate(true);
  };

  const handleCreated = (newProject) => {
    setProjectsLocal((prev) => [newProject, ...(prev || [])]);
  };

  const handleSearch = (value) => {
    setSearchText(value || "");
    setCurrentPage(1);
  };

  if (loadingUsers || projectsLoading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-6 w-full">
      <ProjectsHeader
        user={user}
        onCreateProject={handleCreateProject}
        onSearch={handleSearch}
        searchValue={searchText}
      />

      {/* ✅ TRUYỀN users xuống modal */}
      <CreateProjectModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={handleCreated}
        currentUserId={user?.id}
        users={users}
      />

      {visibleProjects.length === 0 ? (
        <p className="text-gray-500">Không có project nào</p>
      ) : (
        <>
          <ProjectsGrid projects={paginatedProjects} userMap={userMap} />
          <ProjectsPagination
            current={currentPage}
            total={visibleProjects.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default ProjectPage;
