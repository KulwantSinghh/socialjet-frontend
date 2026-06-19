'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AlertsState {
  // IDs of alerts that have been seen (notification dropdown opened)
  seenAlertIds: Set<string>;
  // IDs of alerts that have already been shown as a global toast.
  // Kept separate from seenAlertIds so the bell badge is independent of the toast.
  poppedAlertIds: Set<string>;
  // IDs of all fetched alerts (set by the hook after each fetch)
  fetchedAlertIds: string[];
  // Whether the notification dropdown is open
  notifOpen: boolean;

  // Derived: are there unseen alerts?
  hasUnread: () => boolean;

  // Actions
  setFetchedIds: (ids: string[]) => void;
  markAllSeen: () => void;
  markPopped: (ids: string[]) => void;
  setNotifOpen: (open: boolean) => void;
}

export const useAlertsStore = create<AlertsState>()(
  devtools(
    persist(
      (set, get) => ({
        seenAlertIds: new Set<string>(),
        poppedAlertIds: new Set<string>(),
        fetchedAlertIds: [],
        notifOpen: false,

        hasUnread: () => {
          const { seenAlertIds, fetchedAlertIds } = get();
          return fetchedAlertIds.some((id) => !seenAlertIds.has(id));
        },

        setFetchedIds: (ids: string[]) => set({ fetchedAlertIds: ids }),

        markAllSeen: () =>
          set((state) => ({
            seenAlertIds: new Set([...state.seenAlertIds, ...state.fetchedAlertIds]),
          })),

        markPopped: (ids: string[]) =>
          set((state) => ({
            poppedAlertIds: new Set([...state.poppedAlertIds, ...ids]),
          })),

        setNotifOpen: (open: boolean) => set({ notifOpen: open }),
      }),
      {
        name: 'socialjet-alerts',
        // Persist seenAlertIds (bell dot) and poppedAlertIds (global toast) so neither
        // re-appears after a page refresh.
        partialize: (state) =>
          ({
            seenAlertIds: Array.from(state.seenAlertIds),
            poppedAlertIds: Array.from(state.poppedAlertIds),
          }) as { seenAlertIds: string[]; poppedAlertIds: string[] },
        // Both are Sets — revive them from the arrays that were persisted.
        merge: (persisted, current) => {
          const p = persisted as { seenAlertIds?: string[]; poppedAlertIds?: string[] };
          return {
            ...current,
            seenAlertIds: new Set(p?.seenAlertIds ?? []),
            poppedAlertIds: new Set(p?.poppedAlertIds ?? []),
          };
        },
      }
    ),
    { name: 'AlertsStore' }
  )
);
