import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  AUTH_STORE_STORAGE_KEY,
  REFRESH_TOKEN_KEY,
} from '@/lib/constants';
import { clearAuthSessionCookies, normalizeRole, writeAuthSessionCookies } from '@/lib/authSession';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/roles.types';
import { ENDPOINTS } from './endpoints';

/** Methods that change server state. Admins are view-only on the team monitoring pages. */
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/** Team pages an admin may monitor but not modify (the real Sales / Campaign pages). */
const ADMIN_VIEW_ONLY_PREFIXES = ['/sales', '/campaigns'];

/**
 * Admins can monitor every part of the Sales and Campaign teams via the real
 * /sales and /campaigns pages, but must not be able to change anything there.
 * This blocks any mutating request that originates while an admin is viewing one
 * of those routes, before it reaches the server.
 */
function isAdminViewOnlyBlocked(config: InternalAxiosRequestConfig): boolean {
  if (typeof window === 'undefined') return false;

  const method = (config.method ?? 'get').toLowerCase();
  if (!MUTATING_METHODS.has(method)) return false;

  // Scope the guard to the monitored team pages only (admin keeps full control elsewhere).
  const pathname = window.location.pathname;
  if (!ADMIN_VIEW_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;

  const role = useAuthStore.getState().role ?? readPersistedRoleFromLocalStorage();
  return !!role && normalizeRole(role) === UserRole.Admin;
}

/** Do not run refresh-token flow for these requests (prevents logout/login from hanging on 401). */
function shouldSkipAuthRefresh(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? '';
  const noRefresh = [
    ENDPOINTS.AUTH.LOGOUT,
    ENDPOINTS.AUTH.LOGIN,
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    ENDPOINTS.AUTH.RESET_PASSWORD,
  ];
  return noRefresh.some((path) => url === path || url.endsWith(path));
}

function extractTokensFromRefreshPayload(data: Record<string, unknown>): {
  access: string | null;
  refresh?: string;
} {
  const access =
    (typeof data.access_token === 'string' ? data.access_token : null) ??
    (typeof data.accessToken === 'string' ? data.accessToken : null);
  const refresh =
    (typeof data.refresh_token === 'string' ? data.refresh_token : undefined) ??
    (typeof data.refreshToken === 'string' ? data.refreshToken : undefined);
  return { access, refresh };
}

function readPersistedRoleFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { role?: string } };
    const role = parsed?.state?.role;
    return typeof role === 'string' ? role : null;
  } catch {
    return null;
  }
}

/**
 * Backend refresh contracts differ (JSON snake/camel, OAuth2 form). Try each until one returns an access token.
 */
async function fetchRefreshedSession(
  refreshToken: string
): Promise<{ access: string; refresh?: string }> {
  const url = `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`;
  let lastError: unknown;

  const jsonBodies: Record<string, unknown>[] = [
    { refresh_token: refreshToken },
    { refreshToken: refreshToken },
  ];

  for (const body of jsonBodies) {
    try {
      const { data, status } = await axios.post<Record<string, unknown>>(url, body, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: (s) => s < 500,
      });
      if (status >= 200 && status < 300) {
        const { access, refresh } = extractTokensFromRefreshPayload(data);
        if (access) return { access, refresh };
      }
    } catch (e) {
      lastError = e;
    }
  }

  try {
    const form = new URLSearchParams();
    form.set('grant_type', 'refresh_token');
    form.set('refresh_token', refreshToken);
    const { data, status } = await axios.post<Record<string, unknown>>(url, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      validateStatus: (s) => s < 500,
    });
    if (status >= 200 && status < 300) {
      const { access, refresh } = extractTokensFromRefreshPayload(data);
      if (access) return { access, refresh };
    }
  } catch (e) {
    lastError = e;
  }

  throw lastError instanceof Error ? lastError : new Error('Token refresh failed');
}

/**
 * Centralized Axios instance.
 *
 * Features:
 * - Base URL from environment
 * - Auto-attaches auth token to every request
 * - Auto-refreshes expired tokens (401 handling)
 * - Normalizes all errors into a consistent shape
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor: Attach Auth Token ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (isAdminViewOnlyBlocked(config)) {
      toast.error('View-only access — admins can monitor this team but cannot make changes here.', {
        id: 'admin-view-only',
      });
      return Promise.reject(new axios.CanceledError('ADMIN_VIEW_ONLY'));
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Handle 401 + Token Refresh ----
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

/**
 * Tracks whether we have already triggered a forced logout in this page session.
 * Prevents multiple concurrent 401s (e.g. from polling requests) from each
 * calling window.location.href = '/login' multiple times.
 */
let isForcingLogout = false;

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Returns true only when BOTH the localStorage token AND the cookie are absent,
 * meaning the session is truly gone and forcing a logout redirect is correct.
 * If either still exists, the user is still authenticated — a single 401 from a
 * background poll should NOT evict them.
 */
function isSessionTrulyGone(): boolean {
  if (typeof window === 'undefined') return true;
  const lsToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const cookieToken = document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${AUTH_TOKEN_KEY}=`));
  return !lsToken && !cookieToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying (never chain refresh on auth endpoints like logout)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipAuthRefresh(originalRequest)
    ) {
      if (isRefreshing) {
        // Queue this request until the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { access: newAccessToken, refresh: nextRefresh } =
          await fetchRefreshedSession(refreshToken);

        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
          if (nextRefresh) {
            localStorage.setItem(REFRESH_TOKEN_KEY, nextRefresh);
          }
          const role = useAuthStore.getState().role ?? readPersistedRoleFromLocalStorage();
          if (role) {
            writeAuthSessionCookies(newAccessToken, normalizeRole(role));
          }
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Only force a full logout redirect when the session is truly gone (no valid
        // token in localStorage AND no auth cookie). This prevents a failing background
        // polling request (e.g. /leads/alerts 401) from evicting an otherwise valid session.
        // Note: absence of a refresh token alone is NOT sufficient reason to logout —
        // the user may have logged in without a refresh token and their access token
        // may still be valid. Only evict when all session tokens are gone.
        if (typeof window !== 'undefined' && !isForcingLogout && isSessionTrulyGone()) {
          isForcingLogout = true;
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(AUTH_STORE_STORAGE_KEY);
          clearAuthSessionCookies();
          // Small delay so React can finish any in-flight renders before the hard redirect.
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        // If the session tokens still exist, silently reject — the user stays logged in.
        // The query will show an error state without destroying the auth session.

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
