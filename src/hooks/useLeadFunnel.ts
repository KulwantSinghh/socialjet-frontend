import { useQuery } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import type { FunnelPeriod } from '@/types/leads.types';

export const leadFunnelKeys = {
  all: ['lead-funnel'] as const,
  byPeriod: (period: FunnelPeriod) => [...leadFunnelKeys.all, period] as const,
};

/**
 * Fetches conversion funnel data from GET /leads/funnel?period={period}.
 *
 * @example
 * const { data, isLoading } = useLeadFunnel('month');
 * // data.funnel.leads_captured, data.funnel.contacted, etc.
 */
export function useLeadFunnel(period: FunnelPeriod) {
  return useQuery({
    queryKey: leadFunnelKeys.byPeriod(period),
    queryFn: () => leadsService.getFunnel(period),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
