export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  refresh_token?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ---- Forgot password (OTP) flow ----

export interface RequestResetOtpRequest {
  email: string;
}

export interface RequestResetOtpResponse {
  message: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  reset_token: string;
  expires_in_minutes: number;
  message: string;
}

export interface ResetPasswordWithTokenRequest {
  reset_token: string;
  new_password: string;
}

export interface ResetPasswordWithTokenResponse {
  message: string;
}

export interface CreateUserRequest {
  username: string;
  role: string;
  email?: string;
}

export interface CreateUserResponse {
  user_id: string;
  username: string;
  role: string;
}
