'use client';

import { useQuery } from '@tanstack/react-query';
import { timelineService } from '@/services/timeline.service';

export function useLeadTimeline(leadId: string | undefined) {
  return useQuery({
    queryKey: ['lead-timeline', leadId],
    queryFn: () => timelineService.getLeadTimeline(leadId!),
    enabled: !!leadId,
    staleTime: 30_000,
  });
}
