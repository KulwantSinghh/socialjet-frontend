import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealDetailsService } from '@/services/dealDetails.service';
import type { SaveDealDetailsRequest } from '@/types/dealDetails.types';

export const dealDetailsKeys = {
  all: ['deal-details'] as const,
  detail: (leadId: string) => [...dealDetailsKeys.all, leadId] as const,
};

const POLL_INTERVAL = 30_000;

/**
 * Fetches deal details for a lead, polling so missing data keeps surfacing
 * (a null result means the Lead Details form has not been filled yet).
 *
 * @example
 * const { data: dealDetails, isLoading } = useDealDetails(leadId);
 * const missing = !isLoading && !dealDetails;
 */
export function useDealDetails(leadId: string, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: dealDetailsKeys.detail(leadId),
    queryFn: () => dealDetailsService.get(leadId),
    enabled: !!leadId,
    staleTime: 15_000,
    refetchInterval: options?.poll === false ? false : POLL_INTERVAL,
    refetchOnWindowFocus: false,
  });
}

/**
 * Tracks deal-details completion for a set of leads (pipeline board).
 * Returns a map of lead_id → true (filled) | false (missing); leads still
 * loading are absent from the map so the UI can avoid flashing warnings.
 *
 * @example
 * const filledMap = useDealDetailsStatuses(meetingAndProposalLeadIds);
 * const missing = filledMap[lead.lead_id] === false;
 */
export function useDealDetailsStatuses(leadIds: string[]): Record<string, boolean> {
  const queries = useQueries({
    queries: leadIds.map((leadId) => ({
      queryKey: dealDetailsKeys.detail(leadId),
      queryFn: () => dealDetailsService.get(leadId),
      enabled: !!leadId,
      staleTime: 15_000,
      refetchInterval: POLL_INTERVAL,
      refetchOnWindowFocus: false,
    })),
  });

  const map: Record<string, boolean> = {};
  leadIds.forEach((leadId, i) => {
    const q = queries[i];
    if (q.isSuccess) map[leadId] = q.data != null;
    if (q.isError) map[leadId] = false;
  });
  return map;
}

export function useSaveDealDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDealDetailsRequest) => dealDetailsService.save(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: dealDetailsKeys.detail(payload.lead_id) });
    },
  });
}
