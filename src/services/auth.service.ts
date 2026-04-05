import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '@/types/auth.types';

/**
 * Auth service — handles all authentication-related API calls.
 */
export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get(ENDPOINTS.AUTH.ME);
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },
};
