// Auth API endpoints
import { BaseApiClient } from './base';
import { AuthResponse, LoginCredentials } from '../../models';

export class AuthApi extends BaseApiClient {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/login', { email, password });
    this.setToken(response.accessToken);
    // Lưu user info vào localStorage
    if (response.user) {
      this.saveUserToStorage(response.user);
    }
    return response;
  }

  async register(userData: { email: string; password: string; name: string; role?: string }): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/register', userData);
    this.setToken(response.accessToken);
    // Lưu user info vào localStorage
    if (response.user) {
      this.saveUserToStorage(response.user);
    }
    return response;
  }

  async logout(): Promise<void> {
    this.setToken(null);
    this.removeUserFromStorage();
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Save user to localStorage
  saveUserToStorage(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Remove user from localStorage
  removeUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<any> {
    return this.get<any>(`/users/${id}`);
  }
}

