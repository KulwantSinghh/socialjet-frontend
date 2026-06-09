'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type {
  RequestResetOtpRequest,
  RequestResetOtpResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordWithTokenRequest,
  ResetPasswordWithTokenResponse,
} from '@/types/auth.types';

/**
 * Normalize a FastAPI/Axios error into a human-readable message.
 * Handles `{detail: "..."}`, `{detail: [{msg}]}`, and network failures.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    if (first?.msg) return first.msg;
  }
  if ((err as { code?: string })?.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection and try again.';
  }
  return fallback;
}

export function useRequestResetOtp() {
  return useMutation<RequestResetOtpResponse, Error, RequestResetOtpRequest>({
    mutationFn: (payload) => authService.requestResetOtp(payload),
  });
}

export function useVerifyResetOtp() {
  return useMutation<VerifyResetOtpResponse, Error, VerifyResetOtpRequest>({
    mutationFn: (payload) => authService.verifyResetOtp(payload),
  });
}

export function useResetPasswordWithToken() {
  return useMutation<ResetPasswordWithTokenResponse, Error, ResetPasswordWithTokenRequest>({
    mutationFn: (payload) => authService.resetPasswordWithToken(payload),
  });
}
