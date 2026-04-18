export type MeetingStatus = 'upcoming' | 'done' | 'canceled';

export type MeetingType =
  | 'discovery'
  | 'demo'
  | 'operations_call'
  | 'interview'
  | 'follow_up'
  | 'proposal_review'
  | 'closing';

export const MEETING_TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery Call',
  demo: 'Demo',
  operations_call: 'Operations Call',
  interview: 'Interview',
  follow_up: 'Follow-up',
  proposal_review: 'Proposal Review',
  closing: 'Closing Call',
};

export interface MeetingReport {
  report_id: string;
  meeting_id: string;
  meeting_type: MeetingType;
  summary: string;
  key_points: string[];
  objections: string[];
  next_steps: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  recommended_action: string;
  deal_probability_change: number;
  generated_by: string;
  created_at: string;
}

export interface Meeting {
  meeting_id: string;
  invitee_name: string;
  invitee_email: string;
  invitee_phone?: string;
  lead_id: string | null;
  status: string;
  meeting_status: MeetingStatus;
  meeting_number?: number;
  meeting_type?: MeetingType;
  has_transcript: boolean;
  transcript_status?: 'pending' | 'available' | 'unavailable';
  transcript_content: string | null;
  zoom_join_url: string | null;
  zoom_meeting_id?: string;
  calendly_event_uri?: string;
  calendly_reschedule_url?: string;
  calendly_cancel_url?: string;
  scheduled_at: string;
  event_name: string;
  duration: string | null;
  report?: MeetingReport;
  created_at: string;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  conflicting_meeting_id: string | null;
  conflicting_meeting_time: string | null;
  conflicting_invitee_name: string | null;
  suggested_slots: string[];
}

export interface MeetingsListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MeetingsListParams {
  page?: number;
  page_size?: number;
  meeting_status?: MeetingStatus;
  lead_id?: string;
}
