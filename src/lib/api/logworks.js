// Logworks API endpoints
import { BaseApiClient } from './base';
import { Logwork } from '../../models';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class LogworksApi extends BaseApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  async getLogworks() {
    return this.get('/logworks');
  }

  async getLogwork(id) {
    return this.get(`/logworks/${id}`);
  }

  async createLogwork(logworkData) {
    return this.post('/logworks', logworkData);
  }

  async updateLogwork(id, logworkData) {
    return this.patch(`/logworks/${id}`, logworkData);
  }

  async deleteLogwork(id) {
    return this.delete(`/logworks/${id}`);
  }
}
