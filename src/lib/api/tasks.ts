// Tasks API endpoints
import { BaseApiClient } from './base';
import { Task } from '../../models';

export class TasksApi extends BaseApiClient {
  async getTasks(): Promise<Task[]> {
    return this.get<Task[]>('/tasks');
  }

  async getTask(id: number): Promise<Task> {
    return this.get<Task>(`/tasks/${id}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return this.post<Task>('/tasks', taskData);
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    return this.patch<Task>(`/tasks/${id}`, taskData);
  }

  async deleteTask(id: number): Promise<void> {
    return this.delete<void>(`/tasks/${id}`);
  }
}

