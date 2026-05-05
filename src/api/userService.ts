import apiClient from './client';
import type { UserProfile, UserStats, StreakInfo } from '../types/api';

export const userService = {
  /** Perfil completo com XP, nível e streak */
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/auth/users/profile/');
    return data;
  },

  /** Atualizar nome e/ou username */
  async updateProfile(payload: Partial<Pick<UserProfile, 'name' | 'username'>>): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>('/auth/users/profile/', payload);
    return data;
  },

  /** Estatísticas gerais (questões, taxa de acerto, streak, nível) */
  async getStats(): Promise<UserStats> {
    const { data } = await apiClient.get<UserStats>('/auth/users/stats/');
    return data;
  },

  /** Informações de streak */
  async getStreak(): Promise<StreakInfo> {
    const { data } = await apiClient.get<StreakInfo>('/auth/streak/');
    return data;
  },
};
