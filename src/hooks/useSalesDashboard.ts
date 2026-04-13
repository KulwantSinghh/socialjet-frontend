import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';

export const dashboardKeys = {
  all: ['sales-dashboard'] as const,
};

export function useSalesDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: salesService.getDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });
}
