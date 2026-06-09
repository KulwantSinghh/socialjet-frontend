import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { normalizeRole } from '@/lib/authSession';
import type {
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RequestResetOtpRequest,
  RequestResetOtpResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordWithTokenRequest,
  ResetPasswordWithTokenResponse,
  User,
  CreateUserRequest,
  CreateUserResponse,
} from '@/types/auth.types';

function coerceAuthResponse(payload: unknown): AuthResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid login response');
  }
  const p = payload as Record<string, unknown>;
  const access =
    (typeof p.access_token === 'string' ? p.access_token : null) ??
    (typeof p.accessToken === 'string' ? p.accessToken : null);
  if (!access) {
    throw new Error('Invalid login response: missing access token');
  }
  const refresh =
    (typeof p.refresh_token === 'string' ? p.refresh_token : undefined) ??
    (typeof p.refreshToken === 'string' ? p.refreshToken : undefined);
  const roleRaw = typeof p.role === 'string' ? p.role : 'sales';
  const tokenType =
    (typeof p.token_type === 'string' ? p.token_type : null) ??
    (typeof p.tokenType === 'string' ? p.tokenType : null) ??
    'bearer';

  return {
    access_token: access,
    token_type: tokenType,
    role: normalizeRole(roleRaw),
    refresh_token: refresh,
  };
}

/**
 * Auth service — handles all authentication-related API calls.
 */
export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<unknown>(ENDPOINTS.AUTH.LOGIN, payload);
    return coerceAuthResponse(data);
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

  // ---- Forgot password (OTP) flow ----

  requestResetOtp: async (payload: RequestResetOtpRequest): Promise<RequestResetOtpResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST, payload);
    return data;
  },

  verifyResetOtp: async (payload: VerifyResetOtpRequest): Promise<VerifyResetOtpResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY, payload);
    return data;
  },

  resetPasswordWithToken: async (
    payload: ResetPasswordWithTokenRequest
  ): Promise<ResetPasswordWithTokenResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, payload);
    return data;
  },

  createUser: async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
    // API expects username, role, email as query params (not request body)
    const { data } = await apiClient.post(ENDPOINTS.AUTH.CREATE_USER, null, {
      params: {
        username: payload.username,
        role: payload.role,
        ...(payload.email ? { email: payload.email } : {}),
      },
    });
    return data;
  },
};
