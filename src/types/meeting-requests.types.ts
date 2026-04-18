export type MeetingRequestStatus =
  | 'pending_approval'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | string;

export type MeetingRequestSource = 'whatsapp' | 'calendly' | 'webform' | string;

export interface MeetingRequest {
  request_id: string;
  lead_id: string;
  lead_name: string;
  lead_company: string;
  lead_source: MeetingRequestSource;
  requested_slot: string;
  source: MeetingRequestSource;
  status: MeetingRequestStatus;
  conversation_context: string;
  expires_at: string;
  created_at: string;
}

export interface MeetingRequestsListResponse {
  requests: MeetingRequest[];
  total: number;
}

export interface ConfirmMeetingRequestResponse {
  request_id: string;
  meeting_id: string;
  zoom_join_url: string;
  status: 'confirmed';
}

export interface DeclineMeetingRequestResponse {
  request_id: string;
  status: 'declined';
}

export interface InstantMeetingRequest {
  lead_id: string;
  scheduled_at: string;
  duration_minutes?: number;
}

export interface InstantMeetingResponse {
  meeting_id: string;
  zoom_join_url: string;
  zoom_start_url: string;
  scheduled_at: string;
  invitee_name: string;
  invitee_email: string;
}
