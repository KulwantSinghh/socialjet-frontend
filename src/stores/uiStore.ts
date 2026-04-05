'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  activeModal: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'light',
        activeModal: null,

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        toggleSidebarCollapse: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setTheme: (theme: Theme) => {
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
          }
          set({ theme });
        },
        toggleTheme: () =>
          set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', newTheme);
            }
            return { theme: newTheme };
          }),
        openModal: (modalId: string) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),
      }),
      {
        name: 'socialjet-ui',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
