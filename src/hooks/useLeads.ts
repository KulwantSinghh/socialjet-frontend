import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import type { LeadsListParams } from '@/types/leads.types';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadsListParams) => [...leadKeys.lists(), params] as const,
};

/**
 * Fetches the leads list from GET /leads/ with optional search/status/source filters.
 *
 * @example
 * const { data, isLoading } = useLeads({ search: 'john', status: 'new' });
 */
export function useLeads(params?: LeadsListParams) {
  return useQuery({
    queryKey: leadKeys.list(params ?? {}),
    queryFn: () => leadsService.getLeads(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      leadsService.updateStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}
