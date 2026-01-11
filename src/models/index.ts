// User types
export type UserRole = 'leader' | 'staff';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole; // 'leader' hoặc 'staff'
  password?: string; // Only for creation, not in responses
  approved?: boolean; // Trạng thái duyệt tài khoản (mặc định false - chờ duyệt)
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  userId: number;
  createdAt: string;
}

// Task types
export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  projectId: number;
  userId: number;
  createdAt: string;
}

// Logwork types
export interface Logwork {
  id: number;
  taskId: number;
  userId: number;
  hours: number;
  description: string;
  date: string;
  createdAt: string;
}

// Project Member types
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: 'owner' | 'member';
  createdAt: string;
}

