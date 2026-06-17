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
  raw_html?: string;
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
  raw_html?: string;
}

export interface CampaignDocument {
  id: string;
  leadId: string;
  type: 'onboarding' | 'kol_briefing';
  content: string;
  document?: OnboardingDocument;
  status: 'draft' | 'cm_approved' | 'admin_approved' | 'sent_to_client' | 'rejected';
  rejectionReason?: string;
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
  // Extended creator fields from API
  rate?: string;
  email?: string;
  phone?: string;
  age?: string;
  gender?: string;
  languages?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  telegramHandle?: string;
  otherPlatforms?: string;
  address?: string;
  creatorStatus?: string;
}

export interface CreateCreatorRequest {
  name: string;
  email: string;
  platforms: string[];
  usernames: Record<string, string>;
  pricing: string;
  whatsapp_number: string;
  age?: number;
  location: string;
  niches: string[];
}

export interface CreateCreatorResponse {
  creator_id: string;
  message: string;
  creator: {
    name: string;
    email: string;
    instagram_handle?: string;
    rate?: string;
    whatsapp?: string;
    platforms: string[];
    niches: string[];
    location?: string;
    age?: number;
  };
}

export interface CampaignInfluencer extends Influencer {
  status: InfluencerStatus;
  dealStatus?: DealStatus;
  dealAmount?: number;
  dealNotes?: string;
  addedAt: string;
}

// ─── Discovery / Shortlist ─────────────────────────────────────────────────────

export type ShortlistEntryStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';
export type DiscoveryObjective =
  | 'brand_awareness'
  | 'engagement'
  | 'conversions'
  | 'content_creation';
export type InfluencerTier = 'nano' | 'micro' | 'mid_tier' | 'macro' | 'mega';

export interface ScoreBreakdown {
  niche_match: number;
  budget_fit: number;
  platform_match: number;
  location_match: number;
  language_match: number;
  engagement_rate: number;
  data_completeness: number;
}

export interface ShortlistEntry {
  entry_id: string;
  creator_id: string;
  status: ShortlistEntryStatus;
  match_score: number;
  score_breakdown: ScoreBreakdown;
  estimated_tier: InfluencerTier;
  reasoning: string;
  parsed_rate_ig?: number;
  parsed_rate_tt?: number;
  warnings?: string[];
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  // Enriched creator fields
  creator_name: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  niche?: string;
  location?: string;
  languages?: string;
  gender?: string;
  age?: string;
  rate?: string;
  follower_count?: number;
  engagement_rate?: number;
}

export interface ShortlistSummary {
  shortlist_id: string;
  campaign_id: string;
  status: string;
  total_budget: number;
  batch_count: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  on_hold_count: number;
}

export interface ShortlistResponse {
  shortlist: ShortlistSummary;
  entries: ShortlistEntry[];
  summary: { total: number; approved: number; rejected: number; pending: number; on_hold: number };
  is_fully_approved: boolean;
  can_proceed_to_outreach: boolean;
}

export interface BudgetAllocation {
  tier: InfluencerTier;
  budget_amount: number;
  rate_range: string;
  estimated_count: number;
  available_in_db: number;
}

export interface BudgetPreview {
  total_budget: number;
  objective: DiscoveryObjective;
  allocations: BudgetAllocation[];
  unallocated_budget: number;
  warnings: string[];
}

export interface DiscoveryFilters {
  lead_id?: string;
  total_budget?: number;
  objective?: DiscoveryObjective;
  platforms?: string[];
  niches?: string[];
  locations?: string[];
  languages?: string[];
  min_age?: number;
  max_age?: number;
  gender?: string;
  min_engagement_rate?: number;
  exclude_brands?: string[];
  multi_platform_required?: boolean;
  preferred_tiers?: InfluencerTier[];
  max_results_per_batch?: number;
}

export interface DiscoveryResult {
  shortlist_id: string;
  campaign_id: string;
  batch_number: number;
  budget_allocation: {
    total_budget: number;
    objective: DiscoveryObjective;
    allocations: BudgetAllocation[];
  };
  matches: ShortlistEntry[];
  total_creators_scanned: number;
  total_after_filters: number;
  excluded_count: number;
  has_more: boolean;
  filters_applied: Record<string, unknown>;
  warnings: string[];
}

export interface ShortlistStats {
  has_shortlist: boolean;
  shortlist_id?: string;
  status?: string;
  batch_count: number;
  total_entries: number;
  by_status: { approved: number; rejected: number; pending: number; on_hold: number };
  by_tier: Partial<Record<InfluencerTier, number>>;
  total_budget: number;
  approved_budget_used: number;
  budget_remaining: number;
  is_fully_approved: boolean;
  can_proceed_to_outreach: boolean;
}

/**
 * Where a submitted content link is hosted. Socials play via their official
 * embeds; 'gdrive' via the Drive preview iframe; 'other' covers direct video
 * files / cloud storage URLs played with a native <video> element.
 */
export type ContentPlatform = InfluencerPlatform | 'gdrive' | 'other';

/** Payload row for submitting creator content links. */
export interface ContentLinkInput {
  url: string;
  platform: ContentPlatform;
  caption?: string;
}

export interface ContentItem {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  platform: ContentPlatform;
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

export interface ScheduleEmailVideoPayload {
  content_id: string;
  scheduled_at: string;
}

export interface ScheduleEmailCreatorPayload {
  creator_id: string;
  creator_name: string;
  status: 'finalized';
  videos: number;
  items: ScheduleEmailVideoPayload[];
}

export interface SendScheduleEmailsPayload {
  lead_id: string;
  brand_name: string;
  scheduling_finalized: true;
  emails_sent: number;
  videos_included: number;
  creators: ScheduleEmailCreatorPayload[];
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

export interface PendingDocumentApproval {
  onboarding_id: string;
  lead_id: string;
  doc_type: string;
  status: string;
  document: OnboardingDocument | null;
  submitted_at: string;
  submitted_by: string;
  generated_by: string;
  created_at: string;
  updated_at: string;
  lead_name: string;
  lead_email: string;
  lead_company: string;
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

/* ── Creator Profile (full API response) ──────────────── */

export interface IGBioLink {
  url: string;
}

export interface IGProfile {
  username: string;
  name: string;
  bio?: string;
  avatar: string;
  avatar_hd?: string;
  is_business?: boolean;
  is_private?: boolean;
  posts: number;
  followers: number;
  following: number;
  hearts?: number;
  language?: string;
  created_at?: string;
  external_link?: string;
  bio_links?: IGBioLink[];
  pronouns?: string[];
}

export interface IGMusic {
  artist_name: string;
  song_name: string;
  uses_original_audio?: boolean;
  audio_id: string;
}

export interface IGLocation {
  id: string;
  name: string;
  slug: string;
  has_public_page: boolean;
}

export interface IGTaggedUser {
  username: string;
  name?: string;
  is_verified?: boolean;
}

export interface IGCarouselItem {
  position: number;
  id: string;
  type: 'image' | 'video';
  link: string;
  width: number;
  height: number;
  views?: number;
}

export interface IGPost {
  position: number;
  id: string;
  permalink: string;
  type: 'reel' | 'carousel' | 'image';
  link: string;
  width: number;
  height: number;
  views?: number;
  has_audio?: boolean;
  caption?: string;
  likes: number;
  comments: number;
  iso_date: string;
  thumbnail: string;
  music?: IGMusic;
  location?: IGLocation;
  coauthors?: { username: string }[];
  tagged_users?: IGTaggedUser[];
  carousel_items?: IGCarouselItem[];
}

export interface IGData {
  profile?: IGProfile;
  posts?: IGPost[];
  error?: string;
}

export interface SearchApiData {
  instagram?: IGData;
  tiktok?: IGData;
}

export interface CreatorInfo {
  creator_id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string | null;
  country?: string | null;
  language?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatorProfile {
  success: boolean;
  message: string;
  creator: CreatorInfo;
  searchapi_data: SearchApiData;
}
