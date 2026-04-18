import { useQuery } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';

export const leadStatsKeys = {
  all: ['lead-stats'] as const,
};

/**
 * Fetches lead stats from GET /leads/stats.
 *
 * @example
 * const { data, isLoading } = useLeadStats();
 * // data.by_status.new, data.by_source.calendly, etc.
 */
export function useLeadStats() {
  return useQuery({
    queryKey: leadStatsKeys.all,
    queryFn: leadsService.getStats,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
