/**
 * Legacy API Client - Wrapper để tương thích ngược với code cũ
 * 
 * @deprecated Sử dụng các API modules riêng thay vì apiClient:
 * - authApi thay vì apiClient.login/register/logout
 * - usersApi thay vì apiClient.getUsers/createUser/...
 * - projectsApi, tasksApi, logworksApi tương tự
 * 
 * File này có thể xóa sau khi migrate hết code sang các API modules riêng
 */

import { AuthApi } from './auth';
import { UsersApi } from './users';
import { ProjectsApi } from './projects';
import { TasksApi } from './tasks';
import { LogworksApi } from './logworks';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  baseURL;
  token = null;
  authApi;
  usersApi;
  projectsApi;
  tasksApi;
  logworksApi;

  constructor(baseURL) {
    this.baseURL = baseURL;
    // Tạo instances của các API modules
    this.authApi = new AuthApi(baseURL);
    this.usersApi = new UsersApi(baseURL);
    this.projectsApi = new ProjectsApi(baseURL);
    this.tasksApi = new TasksApi(baseURL);
    this.logworksApi = new LogworksApi(baseURL);

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      // Sync token với các API modules
      if (this.token) {
        this.setToken(this.token);
      }
    }
  }

  setToken(token) {
    this.token = token;
    // Sync token với tất cả API modules
    this.authApi.setToken(token);
    this.usersApi.setToken(token);
    this.projectsApi.setToken(token);
    this.tasksApi.setToken(token);
    this.logworksApi.setToken(token);

    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  // Auth methods - delegate to authApi
  async login(email, password) {
    const result = await this.authApi.login(email, password);
    this.setToken(result.accessToken);
    return result;
  }

  async register(userData) {
    const result = await this.authApi.register(userData);
    this.setToken(result.accessToken);
    return result;
  }

  async logout() {
    return this.authApi.logout();
  }

  getCurrentUserFromStorage() {
    return this.authApi.getCurrentUserFromStorage();
  }

  saveUserToStorage(user) {
    return this.authApi.saveUserToStorage(user);
  }

  removeUserFromStorage() {
    return this.authApi.removeUserFromStorage();
  }

  async getUserById(id) {
    return this.authApi.getUserById(id);
  }

  // Users methods - delegate to usersApi
  async getUsers() {
    return this.usersApi.getUsers();
  }

  async getUser(id) {
    return this.usersApi.getUser(id);
  }

  async createUser(userData) {
    return this.usersApi.createUser(userData);
  }

  async updateUser(id, userData) {
    return this.usersApi.updateUser(id, userData);
  }

  async deleteUser(id) {
    return this.usersApi.deleteUser(id);
  }

  // Projects methods - delegate to projectsApi
  async getProjects() {
    return this.projectsApi.getProjects();
  }

  async getProject(id) {
    return this.projectsApi.getProject(id);
  }

  async createProject(projectData) {
    return this.projectsApi.createProject(projectData);
  }

  async updateProject(id, projectData) {
    return this.projectsApi.updateProject(id, projectData);
  }

  async deleteProject(id) {
    return this.projectsApi.deleteProject(id);
  }

  // Tasks methods - delegate to tasksApi
  async getTasks() {
    return this.tasksApi.getTasks();
  }

  async getTask(id) {
    return this.tasksApi.getTask(id);
  }

  async createTask(taskData) {
    return this.tasksApi.createTask(taskData);
  }

  async updateTask(id, taskData) {
    return this.tasksApi.updateTask(id, taskData);
  }

  async deleteTask(id) {
    return this.tasksApi.deleteTask(id);
  }

  // Logworks methods - delegate to logworksApi
  async getLogworks() {
    return this.logworksApi.getLogworks();
  }

  async getLogwork(id) {
    return this.logworksApi.getLogwork(id);
  }

  async createLogwork(logworkData) {
    return this.logworksApi.createLogwork(logworkData);
  }

  async updateLogwork(id, logworkData) {
    return this.logworksApi.updateLogwork(id, logworkData);
  }

  async deleteLogwork(id) {
    return this.logworksApi.deleteLogwork(id);
  }
}

// Export legacy client
export const createLegacyApiClient = (baseURL) => new ApiClient(baseURL);
