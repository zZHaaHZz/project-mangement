// Projects API endpoints
import { BaseApiClient } from './base';
import { Project } from '../../models';

export class ProjectsApi extends BaseApiClient {
  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id) {
    return this.get(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.post('/projects', projectData);
  }

  async updateProject(id, projectData) {
    return this.patch(`/projects/${id}`, projectData);
  }

  async deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }
}

