'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Syncs the Zustand theme state with the DOM
 * by setting data-theme attribute on <html>.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
