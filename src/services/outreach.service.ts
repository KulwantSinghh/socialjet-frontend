import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  ApproveMessageRequest,
  ClientApprovedResponse,
  ComposeMessageRequest,
  EmailThreadResponse,
  GenerateBulkRequest,
  GenerateBulkResponse,
  GenerateOutreachRequest,
  NegotiateRequest,
  NegotiateResponse,
  NegotiationSummary,
  OptInRequest,
  OutreachAnalytics,
  OutreachInboxResponse,
  OutreachLeadMessagesResponse,
  OutreachMessage,
  OutreachThreadResponse,
  RejectMessageRequest,
  ReplyRequest,
  SendBriefResponse,
  SyncRepliesResponse,
  UpdateNegotiationStatusRequest,
} from '@/types/outreach.types';

/**
 * Influencer Outreach service.
 * Thin, fully-typed HTTP layer over the /outreach/* endpoints.
 */
export const outreachService = {
  // Step 1 — inbox (role filtered by backend)
  getInbox: async (): Promise<OutreachInboxResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.INBOX);
    return data;
  },

  // Pull new inbound replies from the email inbox (call on inbox page load)
  syncReplies: async (): Promise<SyncRepliesResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.SYNC_REPLIES);
    return data;
  },

  // Step 2 — conversation thread with a creator (drafts + negotiation metadata)
  getThread: async (leadId: string, creatorId: string): Promise<OutreachThreadResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.THREAD(leadId, creatorId));
    return data;
  },

  // Two-sided email conversation (sent + inbound replies). Fetching this also
  // clears the creator's has_unread_reply flag server-side.
  getEmailThread: async (leadId: string, creatorId: string): Promise<EmailThreadResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.EMAIL_THREAD(leadId, creatorId));
    return data;
  },

  // Reply to a creator over email
  reply: async (
    leadId: string,
    creatorId: string,
    payload: ReplyRequest
  ): Promise<OutreachMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.REPLY(leadId, creatorId), payload);
    return data;
  },

  // Step 3 — approve draft (auto-sends in background)
  approveMessage: async (
    messageId: string,
    payload?: ApproveMessageRequest
  ): Promise<OutreachMessage> => {
    const { data } = await apiClient.patch(ENDPOINTS.OUTREACH.APPROVE(messageId), payload ?? {});
    return data;
  },

  // Step 3 — reject draft
  rejectMessage: async (
    messageId: string,
    payload?: RejectMessageRequest
  ): Promise<OutreachMessage> => {
    const { data } = await apiClient.patch(ENDPOINTS.OUTREACH.REJECT(messageId), payload ?? {});
    return data;
  },

  // Step 4 — CM composes a custom message
  compose: async (
    leadId: string,
    creatorId: string,
    payload: ComposeMessageRequest
  ): Promise<OutreachMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.COMPOSE(leadId, creatorId), payload);
    return data;
  },

  // Step 5 — paste creator reply, AI generates counter
  negotiate: async (
    leadId: string,
    creatorId: string,
    payload: NegotiateRequest
  ): Promise<NegotiateResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.NEGOTIATE(leadId, creatorId), payload);
    return data;
  },

  // Step 6 — send KOL brief
  sendBrief: async (leadId: string, creatorId: string): Promise<SendBriefResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.SEND_BRIEF(leadId, creatorId));
    return data;
  },

  // 5.2 — manual send / retry
  sendMessage: async (messageId: string): Promise<OutreachMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.SEND(messageId));
    return data;
  },

  // 5.3 — all messages for a lead (optional status filter)
  getLeadMessages: async (
    leadId: string,
    status?: string
  ): Promise<OutreachLeadMessagesResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.LEAD_MESSAGES(leadId), {
      params: status ? { status } : undefined,
    });
    return data;
  },

  // 5.4 — generate draft for one creator
  generate: async (
    leadId: string,
    creatorId: string,
    payload?: GenerateOutreachRequest
  ): Promise<OutreachMessage> => {
    const { data } = await apiClient.post(
      ENDPOINTS.OUTREACH.GENERATE(leadId, creatorId),
      payload ?? {}
    );
    return data;
  },

  // 5.5 — bulk generate for all approved creators
  generateBulk: async (
    leadId: string,
    payload?: GenerateBulkRequest
  ): Promise<GenerateBulkResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.OUTREACH.GENERATE_BULK(leadId), payload ?? {});
    return data;
  },

  // 5.6 — analytics
  getAnalytics: async (leadId: string): Promise<OutreachAnalytics> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.ANALYTICS(leadId));
    return data;
  },

  // 5.7 — negotiation summary
  getNegotiationSummary: async (leadId: string): Promise<NegotiationSummary> => {
    const { data } = await apiClient.get(ENDPOINTS.OUTREACH.NEGOTIATION_SUMMARY(leadId));
    return data;
  },

  // 5.8 — mark opt-in
  optIn: async (
    leadId: string,
    creatorId: string,
    payload: OptInRequest
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.patch(ENDPOINTS.OUTREACH.OPT_IN(leadId, creatorId), payload);
    return data;
  },

  // 5.9 — update negotiation status
  updateNegotiationStatus: async (
    leadId: string,
    creatorId: string,
    payload: UpdateNegotiationStatusRequest
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.patch(
      ENDPOINTS.OUTREACH.NEGOTIATION_STATUS(leadId, creatorId),
      payload
    );
    return data;
  },

  // 5.1 — client-approved creators with full profiles
  getClientApproved: async (leadId: string): Promise<ClientApprovedResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.CLIENT_APPROVED(leadId));
    return data;
  },
};
