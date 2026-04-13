import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  NurtureDashboardResponse,
  NurturePeriod,
  NurtureDetailResponse,
} from '@/types/nurture.types';

export const nurtureService = {
  getDashboard: async (period: NurturePeriod = 'week'): Promise<NurtureDashboardResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NURTURE.DASHBOARD, { params: { period } });
    return data;
  },

  getDetail: async (leadId: string): Promise<NurtureDetailResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NURTURE.DETAIL(leadId));
    return data;
  },
};
