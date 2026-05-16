import apiClient from './client';
import type { MissionProgress } from '../types/api';

export const missionService = {
  /** Missões diárias do usuário */
  async getDailyMissions(): Promise<MissionProgress[]> {
    const { data } = await apiClient.get<MissionProgress[]>('/missions/daily/');
    return data;
  },

  /** Resgatar XP de uma missão concluída */
  async claimMission(missionProgressId: number): Promise<MissionProgress> {
    const { data } = await apiClient.post<MissionProgress>(
      `/missions/${missionProgressId}/claim/`,
      {},
    );
    return data;
  },
};
