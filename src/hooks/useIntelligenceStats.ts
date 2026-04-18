'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface IntelligenceStats {
  calls_processed: number;
  proposals_generated: number;
  proposals_generated_pct: number;
  flagged_count: number;
  flagged_pct: number;
  awaiting_review: number;
  awaiting_review_pct: number;
  period_days: number;
}

export function useIntelligenceStats() {
  return useQuery<IntelligenceStats>({
    queryKey: ['intelligence-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.INTELLIGENCE.STATS);
      return data;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
