import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { LeadTimelineResponse } from '@/types/timeline.types';

export const timelineService = {
  getLeadTimeline: async (leadId: string): Promise<LeadTimelineResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.LEADS.TIMELINE(leadId));
    return data;
  },
};
