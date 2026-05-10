import apiClient from './client';
import type {
  Session,
  StartSessionPayload,
  AnswerPayload,
  AnswerResult,
  FinishSessionPayload,
  SessionResult,
  SessionHistoryItem,
} from '../types/api';

export const sessionService = {
  /** Iniciar uma nova sessão de estudo */
  async startSession(payload: StartSessionPayload): Promise<Session> {
    const { data } = await apiClient.post<Session>('/sessions/start/', payload);
    return data;
  },

  /** Registrar resposta de uma questão */
  async submitAnswer(
    sessionId: number,
    payload: AnswerPayload,
  ): Promise<AnswerResult> {
    const { data } = await apiClient.post<AnswerResult>(
      `/sessions/${sessionId}/answers/`,
      payload,
    );
    return data;
  },

  /** Finalizar a sessão e obter resultado com XP e missões */
  async finishSession(
    sessionId: number,
    payload: FinishSessionPayload,
  ): Promise<SessionResult> {
    const { data } = await apiClient.post<SessionResult>(
      `/sessions/${sessionId}/finish/`,
      payload,
    );
    return data;
  },

  /** Detalhe de uma sessão */
  async getSession(sessionId: number): Promise<Session> {
    const { data } = await apiClient.get<Session>(`/sessions/${sessionId}/`);
    return data;
  },

  /** Histórico de sessões do usuário */
  async getHistory(): Promise<SessionHistoryItem[]> {
    const { data } = await apiClient.get<SessionHistoryItem[]>('/sessions/history/');
    return data;
  },
};
