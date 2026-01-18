// Project Members API endpoints
import { BaseApiClient } from "./base";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class ProjectMembersApi extends BaseApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  getProjectMembers() {
    return this.get("/project_members");
  }

  getProjectMember(id) {
    return this.get(`/project_members/${id}`);
  }

  getProjectMembersByProject(projectId) {
    return this.get(`/project_members?projectId=${projectId}`);
  }

  getProjectMembersByUser(userId) {
    return this.get(`/project_members?userId=${userId}`);
  }

  createProjectMember(memberData) {
    return this.post("/project_members", memberData);
  }

  updateProjectMember(id, memberData) {
    return this.patch(`/project_members/${id}`, memberData);
  }

  deleteProjectMember(id) {
    return this.delete(`/project_members/${id}`);
  }

  async removeMemberFromProject(projectId, userId) {
    const members = await this.getProjectMembersByProject(projectId);
    const member = Array.isArray(members) ? members.find((m) => m.userId === userId) : null;
    if (member) {
      await this.deleteProjectMember(member.id);
    }
  }
}
