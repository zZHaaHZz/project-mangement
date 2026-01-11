// Projects API endpoints
import { BaseApiClient } from './base';
import { Project } from '../../models';

export class ProjectsApi extends BaseApiClient {
  async getProjects(): Promise<Project[]> {
    return this.get<Project[]>('/projects');
  }

  async getProject(id: number): Promise<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    return this.post<Project>('/projects', projectData);
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    return this.patch<Project>(`/projects/${id}`, projectData);
  }

  async deleteProject(id: number): Promise<void> {
    return this.delete<void>(`/projects/${id}`);
  }
}

