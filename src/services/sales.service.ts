import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { VelocityResponse, VelocityPeriod } from '@/types/leads.types';
import type { SalesActivityResponse, SalesDashboard } from '@/types/sales.types';

export const salesService = {
  getVelocity: async (period: VelocityPeriod = 'week'): Promise<VelocityResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.SALES.VELOCITY, {
      params: { period },
    });
    return data;
  },

  getActivity: async (limit: number = 5): Promise<SalesActivityResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.SALES.ACTIVITY, {
      params: { limit },
    });
    return data;
  },

  getDashboard: async (): Promise<SalesDashboard> => {
    const { data } = await apiClient.get(ENDPOINTS.SALES.DASHBOARD);
    return data;
  },
};
