export type TimelineEventType =
  | 'lead_created'
  | 'welcome_email_sent'
  | 'message_sent'
  | 'meeting_booked'
  | 'first_meeting_booked'
  | 'second_meeting_booked'
  | 'third_meeting_booked'
  | 'meeting_done'
  | 'meeting_completed'
  | 'transcript_ready'
  | 'meeting_report_ready'
  | 'proposal_generated'
  | 'proposal_approved'
  | 'proposal_sent'
  | 'client_accepted'
  | 'deal_closed'
  | 'status_changed'
  | 'email_sent'
  | 'nurture_email_sent'
  | 'nurture_email_opened'
  | 'nurture_email_replied'
  | 'whatsapp_sent'
  | 'whatsapp_replied'
  | 'sequence_paused'
  | 'lead_qualified'
  | 'lead_marked_dead'
  | 'no_response_escalation'
  | string;

export const TIMELINE_EVENT_LABELS: Record<string, string> = {
  lead_created: 'Lead captured',
  welcome_email_sent: 'Welcome email sent',
  message_sent: 'Message sent',
  meeting_booked: 'Meeting booked',
  first_meeting_booked: 'First meeting booked',
  second_meeting_booked: 'Second meeting booked',
  third_meeting_booked: 'Third meeting booked',
  meeting_done: 'Meeting completed',
  meeting_completed: 'Meeting completed',
  transcript_ready: 'Transcript available',
  meeting_report_ready: 'AI meeting report generated',
  proposal_generated: 'Proposal created',
  proposal_approved: 'Proposal approved by admin',
  proposal_sent: 'Proposal sent to client',
  client_accepted: 'Client accepted proposal',
  deal_closed: 'Deal closed — Won',
  status_changed: 'Status updated',
  email_sent: 'Email sent',
  nurture_email_sent: 'Nurture email sent',
  nurture_email_opened: 'Lead opened email',
  nurture_email_replied: 'Lead replied to email',
  whatsapp_sent: 'WhatsApp message sent',
  whatsapp_replied: 'Lead replied on WhatsApp',
  sequence_paused: 'Nurture sequence paused',
  lead_qualified: 'Lead qualified',
  lead_marked_dead: 'Lead marked as Dead',
  no_response_escalation: 'No response — follow-up required',
};

export interface TimelineEventMetadata {
  meeting_id?: string;
  meeting_number?: number;
  proposal_id?: string;
  email_id?: string;
  old_status?: string;
  new_status?: string;
  zoom_join_url?: string;
  source?: string;
  actor_name?: string;
}

export interface TimelineEvent {
  event_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string;
  metadata?: TimelineEventMetadata;
  actor_type?: 'system' | 'user' | 'ai';
  created_at: string;
}

export interface LeadTimelineResponse {
  lead_id: string;
  timeline: TimelineEvent[];
}
