'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { IntelligenceCall } from '@/types/intelligence.types';

interface CallState {
  selectedCall: IntelligenceCall | null;
  setSelectedCall: (call: IntelligenceCall) => void;
  clearSelectedCall: () => void;
}

export const useCallStore = create<CallState>()(
  devtools(
    persist(
      (set) => ({
        selectedCall: null,
        setSelectedCall: (call) => set({ selectedCall: call }),
        clearSelectedCall: () => set({ selectedCall: null }),
      }),
      {
        name: 'socialjet-selected-call',
        partialize: (state) => ({ selectedCall: state.selectedCall }),
      }
    ),
    { name: 'CallStore' }
  )
);
