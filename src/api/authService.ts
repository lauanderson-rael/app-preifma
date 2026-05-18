import type { AuthTokens, User, UserProfile } from '../types/api';
import apiClient, { clearTokens, saveTokens } from './client';

export const authService = {
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

  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/login/', {
      email,
      password,
    });
    await saveTokens(data.access, data.refresh);
    return data;
  },


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
  async logout(): Promise<void> {
    await clearTokens(); 
  },

  // ── Password Reset ────────────────────────────────────────── 
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password_reset/', { email });
  },
  async validateResetToken(token: string): Promise<{ status: string }> {
    const { data } = await apiClient.post<{ status: string }>('/auth/password_reset/validate_token/', { token });
    return data;
  },
  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/password_reset/confirm/', { token, password });
  },
};
