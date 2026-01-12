// Project Members API endpoints
import { BaseApiClient } from './base';
import { ProjectMember } from '../../models';

export class ProjectMembersApi extends BaseApiClient {
  async getProjectMembers() {
    return this.get('/project_members');
  }

  async getProjectMember(id) {
    return this.get(`/project_members/${id}`);
  }

  async getProjectMembersByProject(projectId) {
    return this.get(`/project_members?projectId=${projectId}`);
  }

  async getProjectMembersByUser(userId) {
    return this.get(`/project_members?userId=${userId}`);
  }

  async createProjectMember(memberData) {
    return this.post('/project_members', memberData);
  }

  async updateProjectMember(id, memberData) {
    return this.patch(`/project_members/${id}`, memberData);
  }

  async deleteProjectMember(id) {
    return this.delete(`/project_members/${id}`);
  }

  async removeMemberFromProject(projectId, userId) {
    // Tìm member record
    const members = await this.getProjectMembersByProject(projectId);
    const member = members.find(m => m.userId === userId);
    if (member) {
      await this.deleteProjectMember(member.id);
    }
  }
}

