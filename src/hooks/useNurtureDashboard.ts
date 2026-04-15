import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const emailNurtureKeys = {
  history: (leadId: string) => ['email-nurture', 'history', leadId] as const,
};

export function useEmailHistory(leadId: string) {
  return useQuery({
    queryKey: emailNurtureKeys.history(leadId),
    queryFn: () => nurtureService.getEmailHistory(leadId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!leadId,
  });
}

export function useGenerateDraft(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customInstructions?: string) =>
      nurtureService.generateDraft(leadId, customInstructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailNurtureKeys.history(leadId) });
    },
  });
}

export function useApproveEmail(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      emailId,
      subject,
      body,
      cc,
    }: {
      emailId: string;
      subject?: string;
      body?: string;
      cc?: string;
    }) => nurtureService.approveEmail(emailId, { subject, body, cc }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: emailNurtureKeys.history(leadId) });
    },
  });
}

export function useDeleteDraft(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId: string) => nurtureService.deleteEmailDraft(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailNurtureKeys.history(leadId) });
    },
  });
}
