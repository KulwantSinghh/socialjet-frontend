export type CampaignLeadStage =
  | 'unassigned'
  | 'assigned'
  | 'questionnaire_sent'
  | 'questionnaire_received'
  | 'meeting_booked'
  | 'meeting_done'
  | 'documents_generated'
  | 'documents_cm_approved'
  | 'documents_admin_approved'
  | 'documents_sent_to_client'
  | 'influencer_selection'
  | 'influencer_cm_approved'
  | 'influencer_client_approved'
  | 'deal_negotiation'
  | 'deal_closed'
  | 'client_informed'
  | 'content_review'
  | 'content_cm_approved'
  | 'content_client_approved'
  | 'publish_date_assigned'
  | 'live'
  | 'complete';

export type InfluencerPlatform = 'instagram' | 'tiktok' | 'youtube';

export type InfluencerStatus =
  | 'recommended'
  | 'cm_approved'
  | 'cm_rejected'
  | 'client_approved'
  | 'client_rejected'
  | 'assigned';

export type ContentStatus =
  | 'pending'
  | 'submitted'
  | 'cm_approved'
  | 'cm_rejected'
  | 'client_approved'
  | 'client_rejected'
  | 'scheduled';

export type DealStatus = 'negotiating' | 'countered' | 'closed' | 'rejected';

export interface CampaignManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  activeLeads: number;
}

export interface CampaignLead {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAvatar?: string;
  stage: CampaignLeadStage;
  assignedTo?: CampaignManager;
  priority: 'low' | 'medium' | 'high';
  source: string;
  createdAt: string;
  updatedAt: string;
  stageUpdatedAt: string;
  tags?: string[];
}

export interface StageEvent {
  id: string;
  stage: CampaignLeadStage;
  label: string;
  completedAt?: string;
  note?: string;
}

export interface Questionnaire {
  id: string;
  leadId: string;
  sentAt?: string;
  receivedAt?: string;
  questions: QuestionnaireItem[];
}

export interface QuestionnaireItem {
  id: string;
  question: string;
  answer?: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
}

export interface CampaignMeeting {
  id: string;
  leadId: string;
  zoomLink?: string;
  scheduledAt?: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  transcriptUrl?: string;
  reportUrl?: string;
}

export interface OnboardingDocument {
  brand: {
    name: string;
    industry: string;
    contact_name: string;
    email: string;
    phone: string;
    source: string;
    website: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    summary: string;
  };
  campaign: {
    platforms: string[];
    deliverables: string;
    content_timeline: string;
    objectives: string[];
    marketing_message: string;
    creative_angles: string[];
    geographic_focus: string;
  };
  kols: {
    total_count: number | null;
    tier_breakdown: { tier: string; count: number | null }[];
    ideal_profile: string;
    preferred_age_range: string;
    no_gos: string[];
  };
  content: {
    type_preferences: string[];
    tone_and_style: string;
    mandatory_inclusions: string[];
    content_donts: string[];
  };
  product: {
    main_products: string[];
    usps: string[];
    delivery_by: string;
    loan_or_given: string;
    lead_time_days: string;
  };
  offer_and_cta: { offer: string; cta: string; cta_links: string[] };
  budget: string;
  timeline: {
    start_date: string;
    end_date: string;
    key_dates: { date: string; milestone: string; owner: string }[];
    posting_schedule: string;
  };
  pending_items: { item: string; from: string; deadline: string }[];
  client_comments: string[];
  onboarding_call_agenda: string[];
  next_steps: { action: string; owner: string; deadline: string }[];
}

export interface KolBriefDocument {
  campaign_overview: {
    brand_name: string;
    campaign_name: string;
    objective: string;
    marketing_message: string;
    platforms_and_format: string;
    deliverables: string;
    deadlines: string;
  };
  content_angle: {
    story_theme: string[];
    suggested_hooks: string[];
    usps: string[];
    usp_note: string;
  };
  cta: { primary_cta: string; suggested_ctas: string[]; placement: string };
  content_board: { title: string; concept: string; highlights: string[]; cta: string }[];
  guidelines: {
    content_notes: string;
    timeliness: string;
    approval_process: string;
    brand_socials: { website: string; instagram: string; tiktok: string; facebook: string };
    content_usage: string;
    community_guidelines: string;
  };
}

export interface CampaignDocument {
  id: string;
  leadId: string;
  type: 'onboarding' | 'kol_briefing';
  content: string;
  document?: OnboardingDocument;
  status: 'draft' | 'cm_approved' | 'admin_approved' | 'sent_to_client';
  createdAt: string;
  updatedAt: string;
}

export interface KolBrief {
  id: string;
  campaignId: string;
  leadId: string;
  status: 'draft' | 'cm_approved' | 'admin_approved' | 'sent_to_client';
  document?: KolBriefDocument;
  createdAt: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: InfluencerPlatform;
  avatar?: string;
  followers: number;
  engagementRate: number;
  avgViews?: number;
  niche: string[];
  location?: string;
  priceRange?: { min: number; max: number };
  isRecommended?: boolean;
}

export interface CampaignInfluencer extends Influencer {
  status: InfluencerStatus;
  dealStatus?: DealStatus;
  dealAmount?: number;
  dealNotes?: string;
  addedAt: string;
}

export interface ContentItem {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  platform: InfluencerPlatform;
  contentUrl: string;
  thumbnail?: string;
  caption?: string;
  status: ContentStatus;
  submittedAt?: string;
  cmApprovedAt?: string;
  clientApprovedAt?: string;
  scheduledAt?: string;
  cmNote?: string;
  clientNote?: string;
}

export interface InboxMessage {
  id: string;
  from: string;
  fromAvatar?: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
  attachments?: { name: string; url: string }[];
}

export interface InboxConversation {
  id: string;
  type: 'client' | 'influencer';
  participantName: string;
  participantAvatar?: string;
  participantHandle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  leadId?: string;
  messages: InboxMessage[];
}

export interface CampaignDashboardStats {
  totalLeads: number;
  activeLeads: number;
  pendingApprovals: number;
  meetingsThisWeek: number;
  influencersInNegotiation: number;
  leadsPerStage: { stage: string; label: string; count: number }[];
  upcomingMeetings: { leadName: string; scheduledAt: string; zoomLink?: string }[];
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  type:
    | 'approval_needed'
    | 'questionnaire_received'
    | 'content_submitted'
    | 'deal_update'
    | 'meeting_reminder';
  leadId: string;
  leadName: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface ApprovalItem {
  id: string;
  leadId: string;
  leadName: string;
  clientCompany: string;
  type: 'document' | 'influencer_list' | 'content';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
