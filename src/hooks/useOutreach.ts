import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outreachService } from '@/services/outreach.service';
import type {
  ApproveMessageRequest,
  ComposeMessageRequest,
  GenerateBulkRequest,
  NegotiateRequest,
  OptInRequest,
  RejectMessageRequest,
  UpdateNegotiationStatusRequest,
} from '@/types/outreach.types';

/**
 * React Query hooks for the influencer outreach system.
 * Inbox + open threads poll on an interval so backend auto-generated
 * drafts and follow-ups surface without a manual refresh.
 */

export const outreachKeys = {
  all: ['outreach'] as const,
  inbox: () => [...outreachKeys.all, 'inbox'] as const,
  thread: (leadId: string, creatorId: string) =>
    [...outreachKeys.all, 'thread', leadId, creatorId] as const,
  analytics: (leadId: string) => [...outreachKeys.all, 'analytics', leadId] as const,
  summary: (leadId: string) => [...outreachKeys.all, 'summary', leadId] as const,
  clientApproved: (leadId: string) => [...outreachKeys.all, 'client-approved', leadId] as const,
};

// ── Inbox ─────────────────────────────────────────────────────────────────

export function useOutreachInbox() {
  return useQuery({
    queryKey: outreachKeys.inbox(),
    queryFn: () => outreachService.getInbox(),
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

// ── Thread ────────────────────────────────────────────────────────────────

export function useOutreachThread(leadId: string | undefined, creatorId: string | undefined) {
  return useQuery({
    queryKey: outreachKeys.thread(leadId ?? '', creatorId ?? ''),
    queryFn: () => outreachService.getThread(leadId!, creatorId!),
    enabled: !!leadId && !!creatorId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

// ── Aggregates ──────────────────────────────────────────────────────────────

export function useOutreachAnalytics(leadId: string | undefined) {
  return useQuery({
    queryKey: outreachKeys.analytics(leadId ?? ''),
    queryFn: () => outreachService.getAnalytics(leadId!),
    enabled: !!leadId,
    staleTime: 30_000,
  });
}

export function useNegotiationSummary(leadId: string | undefined) {
  return useQuery({
    queryKey: outreachKeys.summary(leadId ?? ''),
    queryFn: () => outreachService.getNegotiationSummary(leadId!),
    enabled: !!leadId,
    staleTime: 30_000,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

/**
 * Invalidate the relevant thread + inbox + aggregates after a thread mutation.
 */
function useThreadInvalidation(leadId: string, creatorId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: outreachKeys.thread(leadId, creatorId) });
    qc.invalidateQueries({ queryKey: outreachKeys.inbox() });
    qc.invalidateQueries({ queryKey: outreachKeys.analytics(leadId) });
    qc.invalidateQueries({ queryKey: outreachKeys.summary(leadId) });
  };
}

export function useApproveMessage(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: string; payload?: ApproveMessageRequest }) =>
      outreachService.approveMessage(messageId, payload),
    onSuccess: invalidate,
  });
}

export function useRejectMessage(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: string; payload?: RejectMessageRequest }) =>
      outreachService.rejectMessage(messageId, payload),
    onSuccess: invalidate,
  });
}

export function useSendMessage(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (messageId: string) => outreachService.sendMessage(messageId),
    onSuccess: invalidate,
  });
}

export function useComposeMessage(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (payload: ComposeMessageRequest) =>
      outreachService.compose(leadId, creatorId, payload),
    onSuccess: invalidate,
  });
}

export function useNegotiate(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (payload: NegotiateRequest) =>
      outreachService.negotiate(leadId, creatorId, payload),
    onSuccess: invalidate,
  });
}

export function useSendBrief(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: () => outreachService.sendBrief(leadId, creatorId),
    onSuccess: invalidate,
  });
}

export function useGenerateOutreach(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (custom_instructions?: string) =>
      outreachService.generate(leadId, creatorId, { custom_instructions }),
    onSuccess: invalidate,
  });
}

export function useGenerateBulk(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: GenerateBulkRequest) => outreachService.generateBulk(leadId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: outreachKeys.inbox() });
    },
  });
}

export function useOptIn(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (payload: OptInRequest) => outreachService.optIn(leadId, creatorId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateNegotiationStatus(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (payload: UpdateNegotiationStatusRequest) =>
      outreachService.updateNegotiationStatus(leadId, creatorId, payload),
    onSuccess: invalidate,
  });
}
