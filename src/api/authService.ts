import apiClient, { clearTokens, saveTokens } from './client';
import type { AuthTokens, User, UserProfile } from '../types/api';

export const authService = {
  /** Registrar novo usuário */
  async register(payload: {
    email: string;
    password: string;
    name: string;
    username: string;
  }): Promise<AuthTokens & { user: User }> {
    const { data } = await apiClient.post('/auth/register/', payload);
    await saveTokens(data.access, data.refresh);
    return data;
  },

  /** Login com e-mail e senha */
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/login/', {
      email,
      password,
    });
    await saveTokens(data.access, data.refresh);
    return data;
  },

  /** Buscar usuário logado */
  async me(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/auth/me/');
    return data;
  },

  /** Renovar token manualmente */
  async refresh(refreshToken: string): Promise<{ access: string }> {
    const { data } = await apiClient.post<{ access: string }>(
      '/auth/refresh/',
      { refresh: refreshToken },
    );
    return data;
  },

  /** Logout local */
  async logout(): Promise<void> {
    await clearTokens();
  },
};
