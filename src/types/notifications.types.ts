export type NotificationType =
  | 'meeting_request'
  | 'transcript_ready'
  | 'proposal_ready'
  | 'proposal_approved'
  | 'meeting_confirmed'
  | 'meeting_canceled'
  | 'proposal_sent'
  | string;

export type NotificationReferenceType = 'meeting_request' | 'proposal' | 'meeting' | string;

export interface Notification {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  lead_id?: string;
  reference_id?: string;
  reference_type?: NotificationReferenceType;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}
