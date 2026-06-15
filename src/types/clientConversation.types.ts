/**
 * Client conversation domain types — email chat between CM and campaign client.
 */

export type ClientMessageDirection = 'inbound' | 'outbound';

export type ClientMessageType = 'client_email' | 'client_reply' | string;

export type ClientMessageStatus = 'sent' | 'received' | 'failed' | string;

export interface ClientConversationMessage {
  message_id?: string;
  lead_id?: string;
  direction: ClientMessageDirection;
  message_type: ClientMessageType;
  subject?: string | null;
  content: string;
  status: ClientMessageStatus;
  to_email?: string | null;
  from_email?: string | null;
  created_at: string;
}

export interface ClientConversationThread {
  lead_id: string;
  client_name: string;
  company: string;
  client_email: string;
  messages: ClientConversationMessage[];
  total: number;
}

export interface ClientInboxConversation {
  lead_id: string;
  client_name: string;
  company: string;
  last_message: string;
  last_direction: ClientMessageDirection | string;
  last_at: string;
}

export interface ClientInboxListResponse {
  conversations: ClientInboxConversation[];
  total: number;
}

export interface ClientSyncRepliesResponse {
  synced: number;
  total_inbound_checked: number;
}

export interface SendClientMessageRequest {
  subject?: string;
  content: string;
}
