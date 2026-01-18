import { BaseApiClient } from "./base";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class ProjectsApi extends BaseApiClient {
  constructor() {
    super(API_BASE_URL);
  }

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
