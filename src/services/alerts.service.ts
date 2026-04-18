import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { LeadAlertsResponse } from '@/types/leads.types';

export const alertsService = {
  getAlerts: async (): Promise<LeadAlertsResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.LEADS.ALERTS);
    return data;
  },
};
