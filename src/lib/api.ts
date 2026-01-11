/**
 * @deprecated File này đã được tách thành các module riêng trong src/lib/api/
 * 
 * File này được giữ lại để tương thích ngược với code cũ.
 * Tất cả logic đã được chuyển sang:
 * - src/lib/api/base.ts - Base API client
 * - src/lib/api/auth.ts - Auth API
 * - src/lib/api/users.ts - Users API
 * - src/lib/api/projects.ts - Projects API
 * - src/lib/api/tasks.ts - Tasks API
 * - src/lib/api/logworks.ts - Logworks API
 * - src/lib/api/index.ts - Export tất cả
 * 
 * Khuyến nghị: Sử dụng import từ 'src/lib/api' thay vì 'src/lib/api.ts'
 * 
 * Ví dụ:
 * - Cũ: import { apiClient } from '../lib/api';
 * - Mới: import { apiClient, usersApi } from '../lib/api';
 */

// Re-export từ module mới để tương thích ngược
export { 
  apiClient, 
  authApi, 
  usersApi, 
  projectsApi, 
  tasksApi, 
  logworksApi,
  projectMembersApi,
  BaseApiClient,
  baseApiClient
} from './api/index';
