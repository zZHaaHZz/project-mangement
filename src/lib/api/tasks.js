import { BaseApiClient } from "./base";

export class TasksApi extends BaseApiClient {

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
