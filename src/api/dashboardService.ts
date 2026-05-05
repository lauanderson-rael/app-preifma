import apiClient from './client';
import type { Dashboard } from '../types/api';

export const dashboardService = {
  /** Dashboard agregado: streak, XP, missões, sessões recentes, progresso */
  async getDashboard(): Promise<Dashboard> {
    const { data } = await apiClient.get<Dashboard>('/dashboard/');
    return data;
  },
};
