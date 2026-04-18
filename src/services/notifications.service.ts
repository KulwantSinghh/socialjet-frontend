import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { NotificationsListResponse, UnreadCountResponse } from '@/types/notifications.types';

export const notificationsService = {
  getNotifications: async (params?: {
    is_read?: boolean;
    type?: string;
    page?: number;
    page_size?: number;
  }): Promise<NotificationsListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params });
    return data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },

  markRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  },

  markAllRead: async (): Promise<{ updated_count: number }> => {
    const { data } = await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return data;
  },
};
