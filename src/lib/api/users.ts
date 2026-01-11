// Users API endpoints
import { BaseApiClient } from './base';
import { User } from '../../models';

export class UsersApi extends BaseApiClient {
  async getUsers(): Promise<User[]> {
    let data = await this.get<User[]>('/users');
    console.log(data)
    return this.get<User[]>('/users');
  }

  async getUser(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return this.post<User>('/users', userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.patch<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }
}

