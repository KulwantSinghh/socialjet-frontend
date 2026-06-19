import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { AdminDashboardResponse } from '@/types/dashboard.types';

export const dashboardService = {
  /** Fetch the full admin dashboard aggregate from GET /admin/dashboard. */
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD);
    return data;
  },
};
