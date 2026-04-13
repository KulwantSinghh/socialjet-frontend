'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AlertsState {
  // IDs of alerts that have been seen (notification dropdown opened)
  seenAlertIds: Set<string>;
  // IDs of all fetched alerts (set by the hook after each fetch)
  fetchedAlertIds: string[];
  // Whether the notification dropdown is open
  notifOpen: boolean;

  // Derived: are there unseen alerts?
  hasUnread: () => boolean;

  // Actions
  setFetchedIds: (ids: string[]) => void;
  markAllSeen: () => void;
  setNotifOpen: (open: boolean) => void;
}

export const useAlertsStore = create<AlertsState>()(
  devtools(
    persist(
      (set, get) => ({
        seenAlertIds: new Set<string>(),
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

        setNotifOpen: (open: boolean) => set({ notifOpen: open }),
      }),
      {
        name: 'socialjet-alerts',
        // Only persist seenAlertIds so the dot doesn't re-appear after page refresh
        partialize: (state) =>
          ({ seenAlertIds: Array.from(state.seenAlertIds) }) as { seenAlertIds: string[] },
        // seenAlertIds is a Set — we must revive it from the array that was persisted
        merge: (persisted, current) => {
          const p = persisted as { seenAlertIds?: string[] };
          return {
            ...current,
            seenAlertIds: new Set(p?.seenAlertIds ?? []),
          };
        },
      }
    ),
    { name: 'AlertsStore' }
  )
);
