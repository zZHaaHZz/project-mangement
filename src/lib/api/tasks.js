// Tasks API endpoints
import { BaseApiClient } from './base';
import { Task } from '../../models';

export class TasksApi extends BaseApiClient {
  async getTasks() {
    return this.get('/tasks');
  }

  async getTask(id) {
    return this.get(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.post('/tasks', taskData);
  }

  async updateTask(id, taskData) {
    return this.patch(`/tasks/${id}`, taskData);
  }

  async deleteTask(id) {
    return this.delete(`/tasks/${id}`);
  }
}

