import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
};

/**
 * Fetches the admin dashboard aggregate from GET /admin/dashboard.
 *
 * Auto-refreshes every 60s and on window focus so the overview stays live
 * without a manual reload. `dataUpdatedAt` powers the header "updated" pill.
 *
 * @example
 * const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useAdminDashboard();
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardKeys.all,
    queryFn: dashboardService.getAdminDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
