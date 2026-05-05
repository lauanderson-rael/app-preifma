import apiClient from './client';
import type { Achievement, UserAchievement } from '../types/api';

export const achievementService = {
  /** Todas as conquistas disponíveis no sistema */
  async getAll(): Promise<Achievement[]> {
    const { data } = await apiClient.get<Achievement[]>('/achievements/');
    return data;
  },

  /** Conquistas desbloqueadas pelo usuário */
  async getUserAchievements(): Promise<UserAchievement[]> {
    const { data } = await apiClient.get<UserAchievement[]>('/achievements/user/');
    return data;
  },
};
