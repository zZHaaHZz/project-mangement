// Utility functions để check quyền (permissions) theo role
import { User, UserRole } from '../../models';

/**
 * Kiểm tra user có phải Leader không
 */
export function isLeader(user: User | null): boolean {
  return user?.role === 'leader';
}

/**
 * Kiểm tra user có phải Staff không
 */
export function isStaff(user: User | null): boolean {
  return user?.role === 'staff';
}

/**
 * Kiểm tra user có quyền thực hiện action không
 * @param user - User hiện tại
 * @param requiredRole - Role yêu cầu để thực hiện action
 */
export function hasPermission(user: User | null, requiredRole: UserRole | UserRole[]): boolean {
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
}

/**
 * Kiểm tra user có quyền quản lý nhân viên không (chỉ Leader)
 */
export function canManageStaff(user: User | null): boolean {
  return isLeader(user);
}

/**
 * Kiểm tra user có quyền quản lý dự án không (Leader hoặc Staff)
 */
export function canManageProject(user: User | null): boolean {
  return !!user; // Cả Leader và Staff đều có thể quản lý dự án
}

/**
 * Kiểm tra user có quyền tạo dự án không (chỉ Leader có thể tạo dự án mới)
 */
export function canCreateProject(user: User | null): boolean {
  return isLeader(user);
}

/**
 * Kiểm tra user có quyền thêm thành viên vào project không
 * Chỉ người tạo project hoặc Leader mới có quyền này
 * @param user - User hiện tại
 * @param projectUserId - ID của người tạo project
 */
export function canAddProjectMember(user: User | null, projectUserId: number): boolean {
  if (!user) return false;
  // Leader có quyền thêm thành viên vào bất kỳ project nào
  if (isLeader(user)) return true;
  // Người tạo project có quyền thêm thành viên
  return user.id === projectUserId;
}

/**
 * Kiểm tra user có tham gia project không
 * User tham gia project nếu:
 * - Là người tạo project (owner)
 * - Hoặc có trong bảng project_members
 * - Hoặc có task trong project đó (fallback - chỉ dùng khi thực sự cần)
 * @param user - User hiện tại
 * @param projectId - ID của project
 * @param projectUserId - ID của người tạo project
 * @param userProjectIds - Danh sách project IDs mà user là member (từ project_members)
 * @param userTaskProjectIds - Danh sách project IDs mà user có tasks (fallback)
 */
export function isProjectMember(
  user: User | null,
  projectId: number,
  projectUserId: number,
  userProjectIds: number[] = [],
  userTaskProjectIds: number[] = []
): boolean {
  if (!user) return false;
  // Leader thấy tất cả projects
  if (isLeader(user)) return true;
  // Người tạo project (owner)
  if (user.id === projectUserId) return true;
  // User có trong project_members (ưu tiên)
  if (userProjectIds.includes(projectId)) return true;
  // Fallback: User có task trong project (chỉ khi không có trong project_members)
  // Chỉ dùng fallback này nếu thực sự cần (ví dụ: project cũ chưa có project_members)
  // Nhưng ưu tiên dùng project_members
  return userTaskProjectIds.includes(projectId);
}

