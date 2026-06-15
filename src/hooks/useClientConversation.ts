import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientConversationService } from '@/services/clientConversation.service';
import type { SendClientMessageRequest } from '@/types/clientConversation.types';

export const clientConversationKeys = {
  all: ['client-conversation'] as const,
  inbox: () => [...clientConversationKeys.all, 'inbox'] as const,
  thread: (leadId: string) => [...clientConversationKeys.all, 'thread', leadId] as const,
};

const POLL_INTERVAL = 15_000;

export function useClientConversationInbox() {
  return useQuery({
    queryKey: clientConversationKeys.inbox(),
    queryFn: () => clientConversationService.getInboxList(),
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useClientConversationThread(leadId: string | undefined) {
  return useQuery({
    queryKey: clientConversationKeys.thread(leadId ?? ''),
    queryFn: () => clientConversationService.getThread(leadId!),
    enabled: !!leadId,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
  });
}

/** Pull inbound client replies from email (call on inbox mount + Clients tab open). */
export function useSyncClientReplies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clientConversationService.syncReplies(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientConversationKeys.inbox() });
      qc.invalidateQueries({ queryKey: clientConversationKeys.all });
    },
  });
}

export function useSendClientMessage(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendClientMessageRequest) =>
      clientConversationService.sendMessage(leadId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientConversationKeys.thread(leadId) });
      qc.invalidateQueries({ queryKey: clientConversationKeys.inbox() });
    },
  });
}
