'use client';

import { create, type StoreApi } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '@/types/auth.types';
import { AUTH_TOKEN_KEY, AUTH_STORE_STORAGE_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { clearAuthSessionCookies, normalizeRole, writeAuthSessionCookies } from '@/lib/authSession';

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;

  setAuth: (role: string, token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

type AuthStoreWithPersist = StoreApi<AuthState> & {
  persist: { clearStorage: () => void };
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, _get, api) => ({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,

        setAuth: (role: string, token: string, refreshToken?: string) => {
          const normalizedRole = normalizeRole(role);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            if (refreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            }
            writeAuthSessionCookies(token, normalizedRole);
          }
          set({ role: normalizedRole, token, isAuthenticated: true });
        },

        setUser: (user: User) => {
          const normalizedRole = normalizeRole(user.role);
          set({ user: { ...user, role: normalizedRole }, role: normalizedRole });
        },

        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            clearAuthSessionCookies();
          }
          set({ user: null, token: null, role: null, isAuthenticated: false });
          const persistApi = (api as AuthStoreWithPersist).persist;
          persistApi?.clearStorage();
        },
      }),
      {
        name: AUTH_STORE_STORAGE_KEY,
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          role: state.role,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error || !state?.token || !state.role || !state.isAuthenticated) return;
          if (typeof window === 'undefined') return;
          writeAuthSessionCookies(state.token, normalizeRole(state.role));
        },
      }
    ),
    { name: 'AuthStore' }
  )
);
