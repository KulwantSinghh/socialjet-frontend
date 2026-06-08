/**
 * Influencer Outreach domain types.
 *
 * Covers the full outreach flow: inbox (leads + creators), conversation threads,
 * draft lifecycle, negotiation, analytics, and status updates.
 */

// ── Shared enums ──────────────────────────────────────────────────────────

export type OutreachChannel = 'email' | 'whatsapp' | 'telegram';

export type OutreachMessageType =
  | 'initial_outreach'
  | 'follow_up_1'
  | 'follow_up_2'
  | 'negotiation'
  | 'brief'
  | 'custom';

export type OutreachMessageStatus = 'draft' | 'approved' | 'edited' | 'sent' | 'rejected';

export type NegotiationStatus =
  | 'pending'
  | 'interested'
  | 'negotiating'
  | 'confirmed'
  | 'declined'
  | 'on_hold'
  | 'no_response';

export type NegotiationIntent =
  | 'interested'
  | 'negotiating'
  | 'declined'
  | 'confirmed'
  | 'not_interested'
  | string;

// ── Inbox (Step 1) ────────────────────────────────────────────────────────

export interface OutreachInboxCreator {
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_email: string;
  profile_image: string;
  total_messages: number;
  draft_count: number;
  last_message: string;
  last_message_at: string | null;
  last_status: OutreachMessageStatus | string;
  negotiation_status: NegotiationStatus;
  negotiation_round: number;
  deal_amount: number | null;
}

export interface OutreachInboxLead {
  lead_id: string;
  client_name: string;
  company: string;
  stage: string;
  assigned_cm: string | null;
  total_creators: number;
  total_drafts: number;
  creators: OutreachInboxCreator[];
}

export interface OutreachInboxResponse {
  inbox: OutreachInboxLead[];
  total_leads: number;
}

// ── Conversation thread (Step 2) ──────────────────────────────────────────

export interface OutreachMessage {
  message_id: string;
  message_type: OutreachMessageType | string;
  channel: OutreachChannel | string;
  subject?: string | null;
  draft_content: string;
  final_content?: string | null;
  status: OutreachMessageStatus | string;
  created_at: string;
  sent_at?: string | null;
  rejected_reason?: string | null;
  // Inbound creator replies (industry-standard two-sided chat).
  // Present when the backend syncs/records the creator's reply.
  direction?: 'inbound' | 'outbound';
  // Negotiation metadata (present on negotiation drafts)
  intent_detected?: NegotiationIntent | null;
  negotiation_round?: number | null;
  offer_amount?: number | null;
  offer_percentage?: number | null;
  escalate?: boolean | null;
}

export interface OutreachThreadResponse {
  messages: OutreachMessage[];
  total: number;
  creator_name: string;
}

// ── Draft lifecycle (Step 3) ──────────────────────────────────────────────

export interface ApproveMessageRequest {
  edited_content?: string;
}

export interface RejectMessageRequest {
  reason?: string;
}

// ── Compose (Step 4) ──────────────────────────────────────────────────────

export interface ComposeMessageRequest {
  content: string;
  subject?: string;
  auto_send?: boolean;
}

// ── Negotiate (Step 5) ────────────────────────────────────────────────────

export interface NegotiateRequest {
  creator_reply: string;
}

export interface NegotiateResponse {
  message_id: string;
  message_type: 'negotiation' | string;
  draft_content: string;
  status: OutreachMessageStatus | string;
  intent_detected: NegotiationIntent;
  negotiation_round: number;
  offer_amount: number | null;
  offer_percentage: number | null;
  escalate: boolean;
}

// ── Send KOL brief (Step 6) ───────────────────────────────────────────────

export interface SendBriefResponse {
  creator_id: string;
  creator_name: string;
  email_sent_to: string;
  brief_sent: boolean;
  sent_at: string;
}

// ── Generate (5.4 / 5.5) ──────────────────────────────────────────────────

export interface GenerateOutreachRequest {
  custom_instructions?: string;
}

export interface GenerateBulkRequest {
  channel?: OutreachChannel;
  custom_instructions?: string;
}

export interface GenerateBulkResultItem {
  message_id: string;
  creator_id: string;
  channel: OutreachChannel | string;
  status: OutreachMessageStatus | string;
  creator_name: string;
}

export interface GenerateBulkResponse {
  generated: GenerateBulkResultItem[];
  errors: { creator_id: string; error: string }[];
  total_generated: number;
  total_errors: number;
}

// ── Lead-wide messages (5.3) ──────────────────────────────────────────────

export interface OutreachLeadMessage extends OutreachMessage {
  creator_id: string;
  creator_name: string;
}

export interface OutreachLeadMessagesResponse {
  messages: OutreachLeadMessage[];
  total: number;
}

// ── Analytics (5.6) ───────────────────────────────────────────────────────

export interface OutreachAnalytics {
  total_messages: number;
  sent_count: number;
  draft_count: number;
  send_rate: number;
  negotiation_breakdown: Record<string, number>;
}

// ── Negotiation summary (5.7) ─────────────────────────────────────────────

export interface NegotiationSummary {
  total_creators: number;
  confirmed: number;
  declined: number;
  negotiating: number;
  avg_closing_amount: number;
  total_closed_value: number;
}

// ── Opt-in / status (5.8 / 5.9) ───────────────────────────────────────────

export interface OptInRequest {
  channel: 'whatsapp' | 'telegram';
  contact_id: string;
}

export interface UpdateNegotiationStatusRequest {
  negotiation_status: NegotiationStatus;
}

// ── Client-approved creators (5.1) ────────────────────────────────────────

export interface ClientApprovedCreatorProfile {
  name: string;
  instagram_handle: string;
  email: string;
  niche: string;
  bio: string;
  engagement_rate: number;
  searchapi_data?: {
    instagram?: Record<string, unknown> | null;
    tiktok?: Record<string, unknown> | null;
  };
}

export interface ClientApprovedCreator {
  creator_id: string;
  status: string;
  source: string;
  deal_status: string | null;
  deal_amount: number | null;
  profile: ClientApprovedCreatorProfile;
}

export interface ClientApprovedResponse {
  lead_id: string;
  brand_name: string;
  creators: ClientApprovedCreator[];
  total: number;
}
