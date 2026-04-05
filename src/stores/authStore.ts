'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '@/types/auth.types';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user: User, token: string, refreshToken: string) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          }
          set({ user, token, isAuthenticated: true });
        },

        setUser: (user: User) => {
          set({ user });
        },

        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
          }
          set({ user: null, token: null, isAuthenticated: false });
        },
      }),
      {
        name: 'socialjet-auth',
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
