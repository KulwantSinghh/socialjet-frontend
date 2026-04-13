import { useQuery } from '@tanstack/react-query';
import { nurtureService } from '@/services/nurture.service';
import type { NurturePeriod } from '@/types/nurture.types';

export const nurtureKeys = {
  dashboard: (period: NurturePeriod) => ['nurture', 'dashboard', period] as const,
  detail: (leadId: string) => ['nurture', 'detail', leadId] as const,
};

export function useNurtureDashboard(period: NurturePeriod = 'week') {
  return useQuery({
    queryKey: nurtureKeys.dashboard(period),
    queryFn: () => nurtureService.getDashboard(period),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useNurtureDetail(leadId: string) {
  return useQuery({
    queryKey: nurtureKeys.detail(leadId),
    queryFn: () => nurtureService.getDetail(leadId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !!leadId,
  });
}
