export type NurturePeriod = 'week' | 'month' | 'day';

// ---- Nurture Detail ----

export interface NurtureDetailLead {
  lead_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  assigned_to: string;
  tags: string[];
}

export interface NurtureSequence {
  type: string | null;
  stage: number;
  status: string;
  is_paused: boolean;
}

export interface NurtureDetailStats {
  total_touches: number;
  messages: number;
  last_touch_at: string;
}

export interface ConversationMessage {
  channel: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  message_id: string;
}

export interface NurtureDetailResponse {
  lead: NurtureDetailLead;
  sequence: NurtureSequence;
  stats: NurtureDetailStats;
  conversation_log: ConversationMessage[];
  pending_email_drafts: unknown[];
}

export interface NurtureStats {
  active_sequences: number;
  awaiting_response: number;
  awaiting_response_pct: number;
  total_messages: number;
  reply_rate: number;
  total_nurtured: number;
}

export interface FunnelDay {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
}

export interface NurtureAgent {
  lead_id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  status: string;
  nurture_status: string;
  sequence_type: string | null;
  conversation_status: string;
  last_message: string;
  last_nurture_at: string;
  message_count: number;
  has_user_reply: boolean;
}

export interface NurtureDashboardResponse {
  stats: NurtureStats;
  conversion_funnel: Record<string, FunnelDay>;
  period: NurturePeriod;
  nurture_agents: NurtureAgent[];
  nurture_agents_count: number;
}
