// Project Members API endpoints
import { BaseApiClient } from './base';
import { ProjectMember } from '../../models';

export class ProjectMembersApi extends BaseApiClient {
  async getProjectMembers(): Promise<ProjectMember[]> {
    return this.get<ProjectMember[]>('/project_members');
  }

  async getProjectMember(id: number): Promise<ProjectMember> {
    return this.get<ProjectMember>(`/project_members/${id}`);
  }

  async getProjectMembersByProject(projectId: number): Promise<ProjectMember[]> {
    return this.get<ProjectMember[]>(`/project_members?projectId=${projectId}`);
  }

  async getProjectMembersByUser(userId: number): Promise<ProjectMember[]> {
    return this.get<ProjectMember[]>(`/project_members?userId=${userId}`);
  }

  async createProjectMember(memberData: Omit<ProjectMember, 'id' | 'createdAt'>): Promise<ProjectMember> {
    return this.post<ProjectMember>('/project_members', memberData);
  }

  async updateProjectMember(id: number, memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    return this.patch<ProjectMember>(`/project_members/${id}`, memberData);
  }

  async deleteProjectMember(id: number): Promise<void> {
    return this.delete<void>(`/project_members/${id}`);
  }

  async removeMemberFromProject(projectId: number, userId: number): Promise<void> {
    // Tìm member record
    const members = await this.getProjectMembersByProject(projectId);
    const member = members.find(m => m.userId === userId);
    if (member) {
      await this.deleteProjectMember(member.id);
    }
  }
}

