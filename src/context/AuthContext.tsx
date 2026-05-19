import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { authService } from '../api/authService';
import { clearTokens, getAccessToken, getRefreshToken } from '../api/client';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import type { UserProfile } from '../types/api';

// ── State ─────────────────────────────────────────────────────
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /** Ao montar: verificar se já existe token válido */
  useEffect(() => {
    (async () => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);

        if (accessToken && refreshToken) {
          const user = await authService.me();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          await clearTokens();
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        await clearTokens();
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOADING' });
    try {
      await authService.login(email, password);
      const user = await authService.me();
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(
        err,
        'Nao foi possivel fazer login. Verifique sua conexao e tente novamente.',
      );
      dispatch({ type: 'ERROR', payload: msg });
      throw err;
    }
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      username: string;
    }) => {
      dispatch({ type: 'LOADING' });
      try {
        await authService.register(payload);
        const user = await authService.me();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (err: any) {
        const msg = getFriendlyErrorMessage(
          err,
          'Nao foi possivel criar a conta. Verifique sua conexao e tente novamente.',
      );
        dispatch({ type: 'ERROR', payload: msg });
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.me();
      dispatch({ type: 'SET_USER', payload: user });
    } catch {
      // silently fail — token refresh interceptor will handle 401
    }
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
