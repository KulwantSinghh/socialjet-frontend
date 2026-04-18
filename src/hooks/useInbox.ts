'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboxService } from '@/services/inbox.service';
import type { SendMessageRequest } from '@/types/inbox.types';

export const INBOX_QUERY_KEY = 'inbox';

export function useInboxConversations() {
  return useQuery({
    queryKey: [INBOX_QUERY_KEY],
    queryFn: () => inboxService.getConversations(),
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useInboxConversation(leadId: string | undefined) {
  return useQuery({
    queryKey: [INBOX_QUERY_KEY, leadId],
    queryFn: () => inboxService.getConversation(leadId!),
    enabled: !!leadId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useSendInboxMessage(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => inboxService.sendMessage(leadId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY, leadId] });
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY] });
    },
  });
}

export function usePauseAutomation(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inboxService.pauseAutomation(leadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY, leadId] });
    },
  });
}

export function useResumeAutomation(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inboxService.resumeAutomation(leadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INBOX_QUERY_KEY, leadId] });
    },
  });
}
