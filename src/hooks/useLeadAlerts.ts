import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { alertsService } from '@/services/alerts.service';
import { useAlertsStore } from '@/stores/alertsStore';

export const alertKeys = {
  all: ['lead-alerts'] as const,
};

export function useLeadAlerts() {
  const setFetchedIds = useAlertsStore((s) => s.setFetchedIds);

  const query = useQuery({
    queryKey: alertKeys.all,
    queryFn: alertsService.getAlerts,
    // Poll every 15 seconds so new leads appear quickly
    refetchInterval: 15_000,
    // Keep stale data visible while re-fetching
    staleTime: 10_000,
    // Re-fetch when the user returns to the tab
    refetchOnWindowFocus: true,
  });

  // Sync fetched IDs to the store whenever data changes
  useEffect(() => {
    if (query.data?.alerts) {
      setFetchedIds(query.data.alerts.map((a) => a.lead_id));
    }
  }, [query.data, setFetchedIds]);

  return query;
}
