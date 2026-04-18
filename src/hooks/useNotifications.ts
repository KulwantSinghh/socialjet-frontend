'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_COUNT_QUERY_KEY = 'notifications-unread-count';

export function useNotifications(params?: { is_read?: boolean; type?: string }) {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationsService.getNotifications(params),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
}
