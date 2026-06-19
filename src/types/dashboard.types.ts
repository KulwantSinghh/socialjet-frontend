/**
 * Types for the admin dashboard aggregate endpoint: GET /admin/dashboard.
 * One payload powers the entire /admin overview page.
 */

/** A single headline metric with a week-over-week trend (can be negative). */
export interface DashboardStat {
  value: number;
  trend: number;
}

export interface DashboardStats {
  active_campaigns: DashboardStat;
  pending_approvals: DashboardStat;
  outreach_replies: DashboardStat;
  ai_influencer_matches: DashboardStat;
}

export interface CampaignHealthSegment {
  name: string;
  value: number;
  /** Hex color supplied by the API for this segment. */
  color: string;
}

export interface CampaignHealth {
  on_track_pct: number;
  total: number;
  segments: CampaignHealthSegment[];
}

export interface RevenueTrendPoint {
  month: string;
  year: number;
  revenue: number;
}

/** Lead funnel — mirrors the Pipeline board's six fixed stages. */
export interface LeadPipelineStage {
  stage: string;
  count: number;
}

/** Campaign lifecycle phase (nine fixed phases). */
export interface CampaignPipelinePhase {
  phase: string;
  label: string;
  count: number;
}

export type TaskPriority = 'High Priority' | 'Due Today' | 'Normal';
export type TaskActionIcon = 'review' | 'send' | 'ai';

export interface DashboardTask {
  id: string;
  title: string;
  subtitle: string;
  priority: TaskPriority;
  action_label: string;
  action_icon: TaskActionIcon;
  count: number;
}

export interface AIActivityItem {
  id: string;
  category: string;
  category_color: string;
  time: string;
  description: string;
  action_label: string;
}

export interface ApprovalsBreakdown {
  proposals: number;
  content: number;
  onboarding_docs: number;
  outreach_drafts: number;
  email_drafts: number;
}

export interface LeadsInsight {
  total: number;
  new_this_week: number;
  closed_won: number;
  conversion_rate: number;
  by_pipeline_status: Record<string, number>;
  by_source: Record<string, number>;
}

export interface MeetingsInsight {
  total: number;
  calls_done: number;
  upcoming: number;
}

export interface CreatorsInsight {
  total: number;
  ai_matches: number;
}

export interface OutreachInsight {
  sent: number;
  replies: number;
  reply_rate: number;
}

export interface ContentInsight {
  total: number;
  submitted: number;
  cm_approved: number;
  client_approved: number;
  scheduled: number;
}

export interface TeamInsight {
  total: number;
  by_role: Record<string, number>;
}

export interface DashboardInsights {
  leads: LeadsInsight;
  meetings: MeetingsInsight;
  creators: CreatorsInsight;
  outreach: OutreachInsight;
  content: ContentInsight;
  team: TeamInsight;
}

export interface AdminDashboardResponse {
  generated_at: string;
  stats: DashboardStats;
  campaign_health: CampaignHealth;
  revenue_trend: RevenueTrendPoint[];
  lead_pipeline: LeadPipelineStage[];
  campaign_pipeline: CampaignPipelinePhase[];
  my_tasks: DashboardTask[];
  ai_activity_feed: AIActivityItem[];
  approvals_breakdown: ApprovalsBreakdown;
  insights: DashboardInsights;
}
