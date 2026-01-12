// API Client - Export tất cả các API modules
// Có thể dễ dàng thay đổi implementation (fetch → axios) trong base.ts

import { BaseApiClient } from './base';
import { AuthApi } from './auth';
import { UsersApi } from './users';
import { ProjectsApi } from './projects';
import { TasksApi } from './tasks';
import { LogworksApi } from './logworks';
import { ProjectMembersApi } from './project-members';
import { createLegacyApiClient } from './legacy';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Tạo instances cho từng API module
export const authApi = new AuthApi(API_BASE_URL);
export const usersApi = new UsersApi(API_BASE_URL);
export const projectsApi = new ProjectsApi(API_BASE_URL);
export const tasksApi = new TasksApi(API_BASE_URL);
export const logworksApi = new LogworksApi(API_BASE_URL);
export const projectMembersApi = new ProjectMembersApi(API_BASE_URL);


// Export base client để có thể dùng chung
export { BaseApiClient } from './base';
export { baseApiClient } from './base';

// Legacy API Client - Giữ lại để tương thích ngược
// TODO: Có thể xóa sau khi migrate hết sang các API modules riêng
export const apiClient = createLegacyApiClient(API_BASE_URL);
