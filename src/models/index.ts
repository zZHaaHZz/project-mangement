// User types
export type UserRole = 'leader' | 'staff';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole; // 'leader' hoặc 'staff'
  password?: string; // Only for creation, not in responses
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
  status: "active" | "inactive" | "completed";
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

