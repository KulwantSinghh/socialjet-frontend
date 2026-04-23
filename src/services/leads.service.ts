import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  LeadStatsResponse,
  LeadFunnelResponse,
  FunnelPeriod,
  CreateLeadRequest,
  LeadsListParams,
  LeadsListResponse,
} from '@/types/leads.types';

export const leadsService = {
  getStats: async (): Promise<LeadStatsResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.LEADS.STATS);
    return data;
  },

  getFunnel: async (period: FunnelPeriod): Promise<LeadFunnelResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.LEADS.FUNNEL, { params: { period } });
    return data;
  },

  create: async (payload: CreateLeadRequest): Promise<unknown> => {
    const { data } = await apiClient.post(ENDPOINTS.LEADS.CREATE, payload);
    return data;
  },

  getLeads: async (params?: LeadsListParams): Promise<LeadsListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.LEADS.LIST, {
      params: {
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.source ? { source: params.source } : {}),
      },
    });
    return data;
  },

  updateStatus: async (leadId: string, status: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.LEADS.STATUS(leadId), { status });
  },
};
