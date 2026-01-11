// Logworks API endpoints
import { BaseApiClient } from './base';
import { Logwork } from '../../models';

export class LogworksApi extends BaseApiClient {
  async getLogworks(): Promise<Logwork[]> {
    return this.get<Logwork[]>('/logworks');
  }

  async getLogwork(id: number): Promise<Logwork> {
    return this.get<Logwork>(`/logworks/${id}`);
  }

  async createLogwork(logworkData: Omit<Logwork, 'id' | 'createdAt'>): Promise<Logwork> {
    return this.post<Logwork>('/logworks', logworkData);
  }

  async updateLogwork(id: number, logworkData: Partial<Logwork>): Promise<Logwork> {
    return this.patch<Logwork>(`/logworks/${id}`, logworkData);
  }

  async deleteLogwork(id: number): Promise<void> {
    return this.delete<void>(`/logworks/${id}`);
  }
}

