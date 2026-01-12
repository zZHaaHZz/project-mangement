// Custom hook để quản lý state cho Projects
// Ví dụ về cách tổ chức state và logic trong custom hooks

import { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { Project } from '../../models';

export function useProjects() {
  // State management
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function để fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProjects();
      setAllProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Tự động fetch projects khi hook được mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function để create project
  const createProject = async (projectData) => {
    try {
      setError(null);
      const newProject = await apiClient.createProject(projectData);
      setAllProjects([...allProjects, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message || 'Failed to create project');
      throw err;
    }
  };

  // Function để update project
  const updateProject = async (id, projectData) => {
    try {
      setError(null);
      const updatedProject = await apiClient.updateProject(id, projectData);
      setAllProjects(allProjects.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    }
  };

  // Function để delete project
  const deleteProject = async (id) => {
    try {
      setError(null);
      await apiClient.deleteProject(id);
      setAllProjects(allProjects.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      throw err;
    }
  };

  const refetch = () => {
    fetchProjects();
  };

  // Return state và functions
  return {
    // Để tương thích với các component đang dùng `projects` / `projectsLoading`
    projects: allProjects,
    projectsLoading: loading,
    allProjects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  };
}

