export type InboxChannel = 'whatsapp' | 'email' | 'webform' | string;
export type InboxSender = 'lead' | 'assistant' | 'user'; // 'user' = human agent (outbound), 'lead' = inbound
export type InboxDirection = 'inbound' | 'outbound';
export type AutomationStatus = 'active' | 'paused' | 'completed';

export interface InboxMessage {
  message_id: string;
  sender: InboxSender;
  direction?: InboxDirection; // email only
  channel: InboxChannel;
  subject?: string; // email only
  text: string;
  timestamp: string;
  is_ai?: boolean;
  status?: 'sent' | 'received';
}

export interface InboxNextMeeting {
  meeting_id: string;
  meeting_number: number;
  scheduled_at: string;
  zoom_join_url: string | null;
  meeting_type?: string;
}

export interface InboxConversation {
  lead_id: string;
  lead_name: string;
  lead_company?: string;
  lead_source: InboxChannel;
  lead_email?: string | null; // populated when lead has an email address
  available_channels?: InboxChannel[]; // e.g. ["whatsapp"] or ["whatsapp","email"]
  lead_status: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: string;
  automation_status: AutomationStatus;
  automation_paused: boolean;
  meeting_count: number;
  next_meeting: InboxNextMeeting | null;
  proposal_status: string | null;
  messages: InboxMessage[];
}

export interface InboxListResponse {
  conversations: InboxConversation[];
  total: number;
  unread_total: number;
}

export interface SendMessageRequest {
  text: string;
  channel: InboxChannel;
  subject?: string; // required when channel === 'email'
  attachments?: File[]; // optional file attachments for email
}

export interface SendMessageResponse {
  message_id: string;
  sent_at: string;
}

export interface AutomationToggleResponse {
  lead_id: string;
  automation_paused: boolean;
  automation_status: AutomationStatus;
}
