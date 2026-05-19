import axios, { AxiosError, InternalAxiosRequestConfig, create } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { markNetworkAvailable, markNetworkUnavailable } from '@/lib/networkStatus';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.100:8000/api';

export const TOKEN_ACCESS_KEY = 'preifma_access_token';
export const TOKEN_REFRESH_KEY = 'preifma_refresh_token';

// ── Token helpers ─────────────────────────────────────────────
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_ACCESS_KEY);
}
export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_REFRESH_KEY);
}
export async function saveTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_ACCESS_KEY, access);
  await SecureStore.setItemAsync(TOKEN_REFRESH_KEY, refresh);
}
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_ACCESS_KEY);
  await SecureStore.deleteItemAsync(TOKEN_REFRESH_KEY);
}

// ── Axios instance ────────────────────────────────────────────
const apiClient = create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track if we're already refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue: {
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    markNetworkAvailable();
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nao tenta refresh em rotas de autenticacao (login, register, password_reset)
    const url = originalRequest.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/password_reset');

    if (error.response) {
      markNetworkAvailable();
    }

    if (error.code === 'ERR_NETWORK' || (!error.response && !!error.request)) {
      markNetworkUnavailable();
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        await saveTokens(data.access, refreshToken);
        processQueue(null, data.access);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
