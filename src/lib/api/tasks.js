import { BaseApiClient } from "./base";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class TasksApi extends BaseApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  getTasks() {
    return this.get("/tasks");
  }
  getTask(id) {
    return this.get(`/tasks/${id}`);
  }
  createTask(taskData) {
    return this.post("/tasks", taskData);
  }
  updateTask(id, taskData) {
    return this.patch(`/tasks/${id}`, taskData);
  }
  deleteTask(id) {
    return this.delete(`/tasks/${id}`);
  }
}
