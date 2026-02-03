// Users API endpoints
import { BaseApiClient } from './base';
import { User } from '../../models';

export class UsersApi extends BaseApiClient {
  async getUsers() {
    let data = await this.get('/users');
    // console.log(data)
    return this.get('/users');
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(id, userData) {
    return this.patch(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }
}

