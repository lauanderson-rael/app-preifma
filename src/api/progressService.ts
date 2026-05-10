import apiClient from './client';
import type { SubjectProgress, PaginatedResponse } from '../types/api';

export const progressService = {
  /** Progresso por matéria (Português e Matemática) */
  async getSubjectProgress(): Promise<SubjectProgress[]> {
    const { data } = await apiClient.get<PaginatedResponse<SubjectProgress>>('/progress/subjects/');
    return data.results;
  },
};
