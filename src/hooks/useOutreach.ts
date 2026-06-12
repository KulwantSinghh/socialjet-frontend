import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outreachService } from '@/services/outreach.service';
import type {
  ApproveMessageRequest,
  ComposeMessageRequest,
  GenerateBulkRequest,
  NegotiateRequest,
  OptInRequest,
  OutreachMessage,
  RejectMessageRequest,
  ReplyRequest,
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
  emailThread: (leadId: string, creatorId: string) =>
    [...outreachKeys.all, 'email-thread', leadId, creatorId] as const,
  negotiationStatus: (leadId: string, creatorId: string) =>
    [...outreachKeys.all, 'negotiation-status', leadId, creatorId] as const,
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

/** Pull new inbound replies from the email inbox (call once on inbox load). */
export function useSyncReplies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => outreachService.syncReplies(),
    onSuccess: () => qc.invalidateQueries({ queryKey: outreachKeys.inbox() }),
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

export function useEmailThread(leadId: string | undefined, creatorId: string | undefined) {
  return useQuery({
    queryKey: outreachKeys.emailThread(leadId ?? '', creatorId ?? ''),
    queryFn: () => outreachService.getEmailThread(leadId!, creatorId!),
    enabled: !!leadId && !!creatorId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

/**
 * Merge the draft/negotiation thread with the email conversation into a single
 * timeline. Messages shared by both endpoints (sent outbound) are deduped by
 * message_id, preferring draft/negotiation richness while adopting the email
 * endpoint's direction/from_email. Inbound replies and drafts each survive.
 */
export function mergeThreadMessages(
  base: OutreachMessage[] = [],
  email: OutreachMessage[] = []
): OutreachMessage[] {
  const map = new Map<string, OutreachMessage>();
  for (const m of base) {
    map.set(m.message_id, { direction: 'outbound', ...m });
  }
  for (const m of email) {
    const existing = map.get(m.message_id);
    map.set(
      m.message_id,
      existing
        ? {
            ...existing,
            direction: m.direction ?? existing.direction,
            from_email: m.from_email ?? existing.from_email,
            subject: m.subject ?? existing.subject,
            final_content: m.final_content ?? existing.final_content,
          }
        : m
    );
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

/**
 * Unified conversation: drafts + negotiation (old endpoint) merged with the
 * two-sided email thread (sent + inbound replies). Also surfaces the merged
 * loading state and the email thread's creator metadata.
 */
export function useCreatorConversation(leadId: string | undefined, creatorId: string | undefined) {
  const base = useOutreachThread(leadId, creatorId);
  const email = useEmailThread(leadId, creatorId);

  const messages = useMemo(
    () => mergeThreadMessages(base.data?.messages, email.data?.messages),
    [base.data?.messages, email.data?.messages]
  );

  return {
    messages,
    creatorName: email.data?.creator_name ?? base.data?.creator_name,
    creatorEmail: email.data?.creator_email,
    isLoading: base.isLoading || email.isLoading,
    // Timestamp of the latest email-thread fetch — used to clear unread state.
    emailFetchedAt: email.dataUpdatedAt,
  };
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
    qc.invalidateQueries({ queryKey: outreachKeys.emailThread(leadId, creatorId) });
    qc.invalidateQueries({ queryKey: outreachKeys.negotiationStatus(leadId, creatorId) });
    qc.invalidateQueries({ queryKey: outreachKeys.inbox() });
    qc.invalidateQueries({ queryKey: outreachKeys.analytics(leadId) });
    qc.invalidateQueries({ queryKey: outreachKeys.summary(leadId) });
  };
}

export function useReply(leadId: string, creatorId: string) {
  const invalidate = useThreadInvalidation(leadId, creatorId);
  return useMutation({
    mutationFn: (payload: ReplyRequest) => outreachService.reply(leadId, creatorId, payload),
    onSuccess: invalidate,
  });
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

export function useNegotiationStatus(leadId: string | undefined, creatorId: string | undefined) {
  return useQuery({
    queryKey: outreachKeys.negotiationStatus(leadId ?? '', creatorId ?? ''),
    queryFn: () => outreachService.getNegotiationStatus(leadId!, creatorId!),
    enabled: !!leadId && !!creatorId,
    staleTime: 10_000,
    refetchInterval: 10_000,
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
