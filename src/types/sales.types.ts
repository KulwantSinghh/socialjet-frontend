// ---- Sales Dashboard ----

export interface SalesDashboard {
  new_leads: number;
  web_form: number;
  calls_done: number;
  conversion_rate: number;
  total_leads: number;
  by_source: Record<string, number>;
  by_status: Record<string, number>;
}

// ---- Activity Feed ----

export type ActivityType = 'zoom_transcript_ready' | string;

export interface SalesActivity {
  activity_id: string;
  activity_type: ActivityType;
  created_at: string;
  created_by: string;
  description: string;
  /** Only present for zoom_transcript_ready */
  host_email?: string;
  meeting_id?: string;
  transcript_url?: string;
  /** Raw transcript text — do NOT render in the feed */
  transcript_content?: string;
}

export interface SalesActivityResponse {
  activities: SalesActivity[];
}
