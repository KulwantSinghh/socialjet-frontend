import { AUTH_TOKEN_KEY } from '@/lib/constants';

const ROLE_COOKIE = 'socialjet_user_role';
const COOKIE_BASE = 'path=/; max-age=86400; SameSite=Lax';

/**
 * Session cookies read by `src/proxy.ts` (edge). Keep in sync with auth store.
 */
export function writeAuthSessionCookies(token: string, role: string): void {
  if (typeof window === 'undefined') return;
  // JWT uses URL-safe base64; do not encode the token (double-decode in middleware can break).
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; ${COOKIE_BASE}`;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; ${COOKIE_BASE}`;
}

export function clearAuthSessionCookies(): void {
  if (typeof window === 'undefined') return;
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const clear = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; expires=${expire}`;
  const clearRole = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax; expires=${expire}`;
  document.cookie = clear;
  document.cookie = clearRole;
}

export function normalizeRole(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, '_');
}
