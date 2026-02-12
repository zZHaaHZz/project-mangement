// Project Members API endpoints
import { BaseApiClient } from "./base";

export class ProjectMembersApi extends BaseApiClient {

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
