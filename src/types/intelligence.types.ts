export type CallStatus = 'processed' | 'flagged' | 'failed' | string;
export type ReviewStatus = 'pending' | 'reviewed' | 'approved' | string;
export type CallOutcome = 'positive' | 'neutral' | 'negative' | string;

export interface IntelligenceCall {
  call_id: string;
  lead_id: string;
  meeting_id: string;
  lead_name: string;
  lead_company: string;
  status: CallStatus;
  call_outcome: CallOutcome;
  has_proposal: boolean;
  flag_for_review: boolean;
  flag_reason: string;
  call_summary: string;
  client_needs: string;
  platform: string;
  duration: string;
  review_status: ReviewStatus;
  analyzed_by: string;
  created_at: string;
}

export interface IntelligenceCallsResponse {
  calls: IntelligenceCall[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IntelligenceCallsParams {
  status?: string;
  review_status?: string;
  days?: number;
  page?: number;
  page_size?: number;
}

export interface ReviewCallRequest {
  review_status: 'reviewed' | 'approved';
  review_notes?: string;
}

export interface MeetingSummaryData {
  timeline: string;
  budget: string;
  discussion_points: string[];
}

export interface MeetingSummaryResponse {
  meeting_id: string;
  lead_name: string;
  platform: string;
  scheduled_at: string;
  summary: MeetingSummaryData;
}

// Sales Analysis (POST /sales/analyze)

export interface SalesPricingTier {
  package_name: string;
  price: string;
  description: string;
  influencer_count_range: string;
}

export interface SalesTimelineMilestone {
  week: string;
  milestone: string;
  deliverable: string;
  description: string;
}

export interface SalesContentType {
  name: string;
  description: string;
  examples: string[];
}

export interface SalesKeyMetric {
  metric: string;
  target: string;
  description: string;
}

export interface SalesAnalysis {
  call_summary: string;
  call_outcome: string;
  budget: string;
  timeline: string;
  client_needs: string;
  campaign_objective: string;
  current_situation: string;
  strategy: string;
  key_challenges: string;
  objectives: string;
  marketing_message: string;
  participants: string[];
  pricing_tiers: SalesPricingTier[];
  execution_plan: string[];
  timeline_milestones: SalesTimelineMilestone[];
  content_types: SalesContentType[];
  key_success_metrics: SalesKeyMetric[];
  package_inclusions: string[];
  value_adds: string[];
  next_steps: string;
  expected_outcomes: string;
  flag_for_review: boolean;
  flag_reason: string;
  pricing_note: string;
  target_audience: {
    primary_audience: string;
    secondary_audience: string;
    demographics: Record<string, string>;
    psychographics: string;
    behavioral_traits: string;
  };
  recommended_ad_budget: {
    daily_budget: string;
    duration: string;
    adjustment_note: string;
  };
  offer_details: {
    offer_type: string;
    description: string;
    call_to_action: string;
  };
  approval_requirements: {
    brand_approvals_needed: string;
    escalation_contact: string;
    timeline: string;
  };
}
