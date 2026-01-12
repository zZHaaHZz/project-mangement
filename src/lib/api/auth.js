// Auth API endpoints
import { BaseApiClient } from './base';
import { AuthResponse, LoginCredentials } from '../../models';

export class AuthApi extends BaseApiClient {
  async login(email, password) {
    const response = await this.post('/login', { email, password });
    this.setToken(response.accessToken);
    // Lưu user info vào localStorage
    if (response.user) {
      this.saveUserToStorage(response.user);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/register', userData);
    this.setToken(response.accessToken);
    // Lưu user info vào localStorage
    if (response.user) {
      this.saveUserToStorage(response.user);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    this.removeUserFromStorage();
  }

  // Get current user from localStorage
  getCurrentUserFromStorage() {
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
  saveUserToStorage(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Remove user from localStorage
  removeUserFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Get user by ID
  async getUserById(id) {
    return this.get(`/users/${id}`);
  }
}

