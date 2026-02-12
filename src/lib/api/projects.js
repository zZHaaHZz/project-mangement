import { BaseApiClient } from "./base";

export class ProjectsApi extends BaseApiClient {

  getProjects() {
    return this.get("/projects");
  }
  getProject(id) {
    return this.get(`/projects/${id}`);
  }
  createProject(data) {
    return this.post("/projects", data);
  }
  updateProject(id, data) {
    return this.patch(`/projects/${id}`, data);
  }
  deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }
}
