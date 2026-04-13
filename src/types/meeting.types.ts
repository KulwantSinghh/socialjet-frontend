export type MeetingStatus = 'upcoming' | 'done' | 'canceled';

export interface Meeting {
  meeting_id: string;
  invitee_name: string;
  invitee_email: string;
  lead_id: string | null;
  status: string;
  meeting_status: MeetingStatus;
  has_transcript: boolean;
  zoom_join_url: string | null;
  scheduled_at: string;
  event_name: string;
  transcript_content: string | null;
  duration: string | null;
  created_at: string;
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
}
