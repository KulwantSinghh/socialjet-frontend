'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { IntelligenceCall, IntelligenceCallsResponse } from '@/types/intelligence.types';

export type { IntelligenceCall };

export function useApprovals() {
  return useQuery<IntelligenceCallsResponse>({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.APPROVALS.PENDING, {
        params: { review_status: 'pending_approval' },
      });
      return data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
