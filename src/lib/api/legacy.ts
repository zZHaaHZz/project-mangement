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
  private baseURL: string;
  private token: string | null = null;
  private authApi: AuthApi;
  private usersApi: UsersApi;
  private projectsApi: ProjectsApi;
  private tasksApi: TasksApi;
  private logworksApi: LogworksApi;

  constructor(baseURL: string) {
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

  setToken(token: string | null) {
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
  async login(email: string, password: string) {
    const result = await this.authApi.login(email, password);
    this.setToken(result.accessToken);
    return result;
  }

  async register(userData: { email: string; password: string; name: string; role?: string }) {
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

  saveUserToStorage(user: any) {
    return this.authApi.saveUserToStorage(user);
  }

  removeUserFromStorage() {
    return this.authApi.removeUserFromStorage();
  }

  async getUserById(id: number) {
    return this.authApi.getUserById(id);
  }

  // Users methods - delegate to usersApi
  async getUsers() {
    return this.usersApi.getUsers();
  }

  async getUser(id: number) {
    return this.usersApi.getUser(id);
  }

  async createUser(userData: any) {
    return this.usersApi.createUser(userData);
  }

  async updateUser(id: number, userData: any) {
    return this.usersApi.updateUser(id, userData);
  }

  async deleteUser(id: number) {
    return this.usersApi.deleteUser(id);
  }

  // Projects methods - delegate to projectsApi
  async getProjects() {
    return this.projectsApi.getProjects();
  }

  async getProject(id: number) {
    return this.projectsApi.getProject(id);
  }

  async createProject(projectData: any) {
    return this.projectsApi.createProject(projectData);
  }

  async updateProject(id: number, projectData: any) {
    return this.projectsApi.updateProject(id, projectData);
  }

  async deleteProject(id: number) {
    return this.projectsApi.deleteProject(id);
  }

  // Tasks methods - delegate to tasksApi
  async getTasks() {
    return this.tasksApi.getTasks();
  }

  async getTask(id: number) {
    return this.tasksApi.getTask(id);
  }

  async createTask(taskData: any) {
    return this.tasksApi.createTask(taskData);
  }

  async updateTask(id: number, taskData: any) {
    return this.tasksApi.updateTask(id, taskData);
  }

  async deleteTask(id: number) {
    return this.tasksApi.deleteTask(id);
  }

  // Logworks methods - delegate to logworksApi
  async getLogworks() {
    return this.logworksApi.getLogworks();
  }

  async getLogwork(id: number) {
    return this.logworksApi.getLogwork(id);
  }

  async createLogwork(logworkData: any) {
    return this.logworksApi.createLogwork(logworkData);
  }

  async updateLogwork(id: number, logworkData: any) {
    return this.logworksApi.updateLogwork(id, logworkData);
  }

  async deleteLogwork(id: number) {
    return this.logworksApi.deleteLogwork(id);
  }
}

// Export legacy client
export const createLegacyApiClient = (baseURL: string) => new ApiClient(baseURL);

