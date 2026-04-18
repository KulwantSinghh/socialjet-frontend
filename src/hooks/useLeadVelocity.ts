import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';
import type { VelocityPeriod, ChartDataPoint } from '@/types/leads.types';

// Canonical day order for "week" period
const WEEK_DAY_ORDER: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const velocityKeys = {
  byPeriod: (period: VelocityPeriod) => ['lead-velocity', period] as const,
};

export function useLeadVelocity(period: VelocityPeriod = 'week') {
  return useQuery({
    queryKey: velocityKeys.byPeriod(period),
    queryFn: () => salesService.getVelocity(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    // Keep previous period's data visible while new period loads (no flash)
    placeholderData: keepPreviousData,
    select: (data): ChartDataPoint[] => {
      const entries = Object.entries(data.velocity);

      // Sort by known day order if available, otherwise keep original order
      const sorted =
        period === 'week'
          ? entries.sort(([a], [b]) => (WEEK_DAY_ORDER[a] ?? 99) - (WEEK_DAY_ORDER[b] ?? 99))
          : entries;

      return sorted.map(([label, stats]) => ({
        name: label,
        newLeads: stats.new_leads,
        qualified: stats.qualified,
        proposals: stats.proposals,
      }));
    },
  });
}
