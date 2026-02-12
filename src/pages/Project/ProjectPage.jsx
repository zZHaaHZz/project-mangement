import React, { useEffect, useMemo, useState } from "react";
import { message } from "antd";

import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectMembers } from "@/lib/hooks/useProjectMembers";
import { useTasks } from "@/lib/hooks/useTasks";
import { isProjectMember } from "@/lib/utils/permissions";
import { usersApi } from "@/lib/api";

import ProjectsGrid from "@/components/Project/ProjectsGrid.jsx";
import ProjectsPagination from "@/components/Project/ProjectsPagination.jsx";
import CreateProjectModal from "@/components/Project/CreateProjectModal.jsx";
import ProjectFilters from "@/components/Project/ProjectFilters.jsx";
import ProjectEmptyState from "@/components/Project/ProjectEmptyState.jsx";
import { useLayout } from "@/contexts/LayoutContext";

const ProjectPage = () => {
  const { user } = useAuth();

  const projectsHook = useProjects();
  const projects = projectsHook?.projects ?? [];
  const projectsLoading = projectsHook?.projectsLoading ?? projectsHook?.loading ?? false;

  const { members = [] } = useProjectMembers();
  const { tasks = [], loading: tasksLoading } = useTasks();

  const [openCreate, setOpenCreate] = useState(false);

  // ✅ users lấy từ DB bằng usersApi (giống UserPage)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const [projectsLocal, setProjectsLocal] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = mới nhất, asc = cũ nhất
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
      const data = await usersApi.getUsers(); // ✅
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

    let base = projectsLocal;

    // 1. Quyền truy cập
    if (user.role !== "leader") {
      base = base.filter((project) =>
        isProjectMember(user, project.id, project.userId, userProjectIds, userTaskProjectIds)
      );
    }

    // 2. Lọc theo trạng thái
    if (filterStatus !== "all") {
      base = base.filter((p) => p.status === filterStatus);
    }

    // 3. Sắp xếp
    return [...base].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [projectsLocal, user, userProjectIds, userTaskProjectIds, filterStatus, sortOrder]);

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

  const projectsWithProgress = useMemo(() => {
    const now = new Date();
    return visibleProjects.map(p => {
      const projectTasks = tasks.filter(t => Number(t.projectId) === Number(p.id));
      const total = projectTasks.length;
      const completed = projectTasks.filter(t => t.status === "done").length;

      const overdueTasks = projectTasks.filter(t =>
        t.status !== "done" &&
        t.dueDate &&
        new Date(t.dueDate) < now
      );

      return {
        ...p,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        isAtRisk: overdueTasks.length > 0,
        overdueCount: overdueTasks.length
      };
    });
  }, [visibleProjects, tasks]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return projectsWithProgress.slice(startIndex, startIndex + pageSize);
  }, [projectsWithProgress, currentPage]);

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

  const { setHeaderActions } = useLayout();

  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-6 w-full">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-slate-400 font-medium"
            placeholder="Tìm kiếm dự án..."
            type="text"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {user?.role === "leader" && (
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-primary/20 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Tạo dự án mới</span>
          </button>
        )}
      </div>
    );
    return () => setHeaderActions(null);
  }, [searchText, user, setHeaderActions]);

  if (loadingUsers || projectsLoading || tasksLoading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

  return (
    <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      <div className="px-8 py-8 flex flex-col gap-8">
        <ProjectFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalVisible={visibleProjects.length}
        />

        {visibleProjects.length === 0 ? (
          <ProjectEmptyState />
        ) : (
          <>
            <ProjectsGrid projects={paginatedProjects} userMap={userMap} />
            <div className="mt-8">
              <ProjectsPagination
                current={currentPage}
                total={visibleProjects.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      <CreateProjectModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={handleCreated}
        currentUserId={user?.id}
        users={users}
      />
    </main>
  );
};

export default ProjectPage;
