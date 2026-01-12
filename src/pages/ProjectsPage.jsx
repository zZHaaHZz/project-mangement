"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Project, User } from "../models";
import { message } from "antd";

import { useAuth } from "../contexts/AuthContext";
import { useProjects } from "../lib/hooks/useProjects";
import { useProjectMembers } from "../lib/hooks/useProjectMembers";
import { isProjectMember } from "../lib/utils/permissions";
import { usersApi } from "../lib/api";

import ProjectsHeader from "../components/projects/ProjectsHeader";
import ProjectsGrid from "../components/projects/ProjectsGrid";
import ProjectsPagination from "../components/projects/ProjectsPagination";

const getUsers = async () => usersApi.getUsers();

const ProjectsPage = () => {
  const { user } = useAuth();

  // Hook của bạn có thể trả về: { projects, loading } hoặc { projects, projectsLoading }
  const projectsHook = useProjects();
  const projects = projectsHook.projects ?? [];
  const projectsLoading =
    projectsHook.projectsLoading ?? projectsHook.loading ?? false;

  const { members } = useProjectMembers();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const pageSize = 12;

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        setError("");
        const fetchedUsers = await getUsers(); // tránh shadow biến user
        setUsers(fetchedUsers);
      } catch (e) {
        console.error(e);
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  // map userId -> user để show "tạo bởi"
  const userMap = useMemo(() => {
    // Quan trọng: dùng đúng kiểu key theo User.id (nhiều bạn bỏ company xong đổi mock id sang string)
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Lấy projectIds mà user là member (từ project_members)
  const userProjectIds = useMemo(() => {
    if (!user) return [];
    return members
      .filter((m) => m.userId === user.id)
      .map((m) => m.projectId);
  }, [members, user]);

  // Fallback nếu sau này bạn muốn: projectIds mà user có tasks
  const userTaskProjectIds = useMemo(() => {
    return [];
  }, []);

  // Staff chỉ thấy projects tham gia, Leader thấy tất cả
  const filteredProjects = useMemo(() => {
    if (!user) return [];

    if (user.role === "leader") {
      return projects;
    }

    return projects.filter((project) =>
      isProjectMember(
        user,
        project.id,
        project.userId,
        userProjectIds,
        userTaskProjectIds
      )
    );
  }, [projects, user, userProjectIds, userTaskProjectIds]);

  // Search
  const visibleProjects = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return filteredProjects;

    return filteredProjects.filter((p) => {
      const nameMatch = (p.name ?? "").toLowerCase().includes(q);
      const descMatch = (p.description ?? "").toLowerCase().includes(q);
      return nameMatch || descMatch;
    });
  }, [filteredProjects, searchText]);

  // Reset trang khi list thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [visibleProjects.length]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return visibleProjects.slice(startIndex, startIndex + pageSize);
  }, [visibleProjects, currentPage]);

  if (loadingUsers || projectsLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500">Lỗi: {error}</div>;
  }

  const handleCreateProject = () => {
    message.info("Tính năng chỉnh sửa đang được phát triển");
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 w-full">
      <ProjectsHeader
        user={user}
        onCreateProject={handleCreateProject}
        onSearch={handleSearch}
        searchValue={searchText}
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

export default ProjectsPage;
