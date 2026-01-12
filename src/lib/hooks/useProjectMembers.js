// Custom hook để quản lý state cho Project Members
import { useState, useEffect } from 'react';
import { projectMembersApi } from '../api';
import { ProjectMember } from '../../models';

export function useProjectMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectMembersApi.getProjectMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch project members');
    } finally {
      setLoading(false);
    }
  };

  const getMembersByProject = async (projectId) => {
    try {
      setError(null);
      return await projectMembersApi.getProjectMembersByProject(projectId);
    } catch (err) {
      setError(err.message || 'Failed to fetch project members');
      throw err;
    }
  };

  const getMembersByUser = async (userId) => {
    try {
      setError(null);
      return await projectMembersApi.getProjectMembersByUser(userId);
    } catch (err) {
      setError(err.message || 'Failed to fetch project members');
      throw err;
    }
  };

  const addMember = async (memberData) => {
    try {
      setError(null);
      const newMember = await projectMembersApi.createProjectMember(memberData);
      setMembers([...members, newMember]);
      return newMember;
    } catch (err) {
      setError(err.message || 'Failed to add project member');
      throw err;
    }
  };

  const removeMember = async (id) => {
    try {
      setError(null);
      await projectMembersApi.deleteProjectMember(id);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to remove project member');
      throw err;
    }
  };

  const refetch = () => {
    fetchMembers();
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    getMembersByProject,
    getMembersByUser,
    addMember,
    removeMember,
    refetch,
  };
}

