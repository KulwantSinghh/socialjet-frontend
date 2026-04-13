import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { leadStatsKeys } from '@/hooks/useLeadStats';
import { alertKeys } from '@/hooks/useLeadAlerts';
import { leadKeys } from '@/hooks/useLeads';

/**
 * Mutation hook for POST /leads/ — creates a manual lead.
 * Invalidates lead stats and alerts caches on success so the page updates.
 *
 * @example
 * const createLead = useCreateLead();
 * createLead.mutate(payload, { onSuccess, onError });
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadsService.create,
    onSuccess: () => {
      // Refresh the leads table, counts, and alert banner after a new lead is created
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadStatsKeys.all });
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
}
