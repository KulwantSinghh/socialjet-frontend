import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/services/campaigns.service';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CampaignLeadStage } from '@/types/campaign.types';

export const CAMPAIGN_LEADS_KEY = 'campaign-leads';

export function useCampaignLeads(params?: {
  search?: string;
  stage?: CampaignLeadStage;
  assignedTo?: string;
}) {
  return useQuery({
    queryKey: [CAMPAIGN_LEADS_KEY, params],
    queryFn: () => campaignsService.getLeads(params),
    staleTime: 30_000,
  });
}

export function useCampaignLeadDetail(id: string) {
  return useQuery({
    queryKey: [CAMPAIGN_LEADS_KEY, id],
    queryFn: () => campaignsService.getLeadDetail(id),
    staleTime: 10_000,
    enabled: !!id,
    // Auto-update the lead's stage without a manual page refresh.
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useCampaignManagers() {
  return useQuery({
    queryKey: ['campaign-managers'],
    queryFn: () => campaignsService.getCampaignManagers(),
    staleTime: 60_000,
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, managerId }: { leadId: string; managerId: string }) =>
      campaignsService.assignLead(leadId, managerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CAMPAIGN_LEADS_KEY] });
    },
  });
}

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, stage }: { leadId: string; stage: CampaignLeadStage }) =>
      campaignsService.updateStage(leadId, stage),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: [CAMPAIGN_LEADS_KEY, leadId] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['campaign-dashboard-stats'],
    queryFn: () => campaignsService.getDashboardStats(),
    staleTime: 30_000,
  });
}

export function useQuestionnaire(leadId: string) {
  return useQuery({
    queryKey: ['campaign-questionnaire', leadId],
    queryFn: () => campaignsService.getQuestionnaire(leadId),
    staleTime: 30_000,
    enabled: !!leadId,
  });
}

export function useCampaignMeeting(leadId: string) {
  return useQuery({
    queryKey: ['campaign-meeting', leadId],
    queryFn: () => campaignsService.getMeeting(leadId),
    staleTime: 30_000,
    enabled: !!leadId,
  });
}

export function useCampaignDocuments(leadId: string) {
  return useQuery({
    queryKey: ['campaign-documents', leadId],
    queryFn: () => campaignsService.getDocuments(leadId),
    staleTime: 15_000,
    enabled: !!leadId,
  });
}

export function useKolBrief(leadId: string) {
  return useQuery({
    queryKey: ['kol-brief', leadId],
    queryFn: () => campaignsService.getKolBrief(leadId),
    staleTime: 15_000,
    enabled: !!leadId,
  });
}

export function useLeadInfluencers(leadId: string) {
  return useQuery({
    queryKey: ['lead-influencers', leadId],
    queryFn: () => campaignsService.getLeadInfluencers(leadId),
    staleTime: 15_000,
    enabled: !!leadId,
  });
}

// ── Discovery / Shortlist hooks ───────────────────────────────────────────────

export function useBudgetPreview(
  campaignId: string,
  totalBudget: number,
  objective: import('@/types/campaign.types').DiscoveryObjective
) {
  return useQuery({
    queryKey: ['budget-preview', campaignId, totalBudget, objective],
    queryFn: () => campaignsService.getBudgetPreview(campaignId, totalBudget, objective),
    staleTime: 60_000,
    enabled: !!campaignId && totalBudget > 0,
  });
}

export function useShortlist(
  campaignId: string,
  params?: { batch_number?: number; status?: string },
  enabled = true
) {
  return useQuery({
    queryKey: ['shortlist', campaignId, params],
    queryFn: () => campaignsService.getShortlist(campaignId, params),
    staleTime: 15_000,
    enabled: !!campaignId && enabled,
  });
}

export function useShortlistStats(campaignId: string, enabled = true) {
  return useQuery({
    queryKey: ['shortlist-stats', campaignId],
    queryFn: () => campaignsService.getShortlistStats(campaignId),
    staleTime: 15_000,
    enabled: !!campaignId && enabled,
  });
}

export function useRunDiscovery(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filters: import('@/types/campaign.types').DiscoveryFilters) =>
      campaignsService.runDiscovery(campaignId, filters),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shortlist', campaignId] });
      qc.invalidateQueries({ queryKey: ['shortlist-stats', campaignId] });
    },
  });
}

export function useUpdateShortlistEntry(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entryId,
      status,
      rejection_reason,
    }: {
      entryId: string;
      status: import('@/types/campaign.types').ShortlistEntryStatus;
      rejection_reason?: string;
    }) => campaignsService.updateShortlistEntry(campaignId, entryId, { status, rejection_reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shortlist', campaignId] });
      qc.invalidateQueries({ queryKey: ['shortlist-stats', campaignId] });
    },
  });
}

export function useLoadNextBatch(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts?: {
      max_results?: number;
      additional_niches?: string[];
      additional_locations?: string[];
    }) => campaignsService.loadNextBatch(campaignId, opts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shortlist', campaignId] });
      qc.invalidateQueries({ queryKey: ['shortlist-stats', campaignId] });
    },
  });
}

export function useTransitionPhase(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ targetPhase, reason }: { targetPhase: string; reason?: string }) =>
      campaignsService.transitionPhase(campaignId, targetPhase, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-leads'] });
    },
  });
}

export function useCreatorDetail(creatorId: string | null) {
  return useQuery({
    queryKey: ['creator-detail', creatorId],
    queryFn: () => campaignsService.getCreatorDetail(creatorId!),
    staleTime: 60_000,
    enabled: !!creatorId,
  });
}

export function useCreatorProfile(creatorId: string | null) {
  return useQuery({
    queryKey: ['creator-profile', creatorId],
    queryFn: () => campaignsService.getCreatorProfile(creatorId!),
    staleTime: 60_000,
    enabled: !!creatorId,
  });
}

export function useAllInfluencers(params?: { search?: string; platform?: string; niche?: string }) {
  return useQuery({
    queryKey: ['influencers', params],
    queryFn: () => campaignsService.getAllInfluencers(params),
    staleTime: 60_000,
  });
}

export function useCreateInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: import('@/types/campaign.types').CreateCreatorRequest) =>
      campaignsService.createInfluencer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
}

export function useCampaignApprovals() {
  return useQuery({
    queryKey: ['campaign-approvals'],
    queryFn: () => campaignsService.getApprovals(),
    staleTime: 15_000,
  });
}

export function useCampaignConversations() {
  return useQuery({
    queryKey: ['campaign-conversations'],
    queryFn: () => campaignsService.getConversations(),
    staleTime: 5_000,
  });
}

export function useApproveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type?: string }) =>
      campaignsService.approveItem(id, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-approvals'] });
    },
  });
}

export function useRejectItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, type }: { id: string; reason?: string; type?: string }) =>
      campaignsService.rejectItem(id, reason, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign-approvals'] });
    },
  });
}

// ── Recommendations hooks ─────────────────────────────────────────────────────

export interface RecommendationInstagramPost {
  position: number;
  id: string;
  permalink: string;
  type: 'image' | 'carousel' | 'reel' | string;
  link: string;
  thumbnail: string;
  caption?: string;
  likes?: number;
  comments?: number;
  views?: number;
  iso_date?: string;
  width?: number;
  height?: number;
}

export interface RecommendationCreator {
  creator_id: string;
  name: string;
  tier: string;
  country: string;
  languages: string[] | null;
  niches: string[] | null;
  instagram_followers: number | null;
  tiktok_followers: number | null;
  max_followers: number | null;
  engagement_rate: number | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  recommendation_score: number;
  score_breakdown: {
    niche: number;
    engagement: number;
    completeness: number;
    tier?: number;
    followers?: number;
    location?: number;
    semantic?: number;
  };
  selection_reason: string;
  status: 'accepted' | 'rejected' | 'pending' | null;
  profile_picture?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  rate?: string | null;
  external_link?: string | null;
  gender?: string | null;
  age?: number | null;
  is_verified?: boolean;
  is_business?: boolean;
  searchapi_data?: {
    instagram?: {
      profile?: {
        bio_links?: { url: string }[];
        external_link?: string;
      };
      posts?: RecommendationInstagramPost[];
    };
  };
}

export interface RecommendationsResponse {
  requirement_id: string;
  lead_id: string;
  documents_used: {
    kol_briefs: number;
    meetings_total: number;
    meetings_with_transcripts: number;
    proposals: number;
  };
  extracted_requirements: {
    campaign_objective: string;
    platforms: string[];
    niches: string[];
    brand_style: string[];
    min_engagement_rate: number;
    preferred_tier: string;
    additional_notes: string;
    audience_age_range?: string;
    audience_country?: string;
    locations?: string[];
    min_followers?: number;
    num_creators_needed?: number;
    can_visit_location?: boolean;
    is_comedic?: boolean;
    is_presentable?: boolean;
  };
  matched_creators: RecommendationCreator[];
  total_matched: number;
}

export function useRecommendations(leadId: string) {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', leadId],
    queryFn: async () => {
      const res = await apiClient.get<RecommendationsResponse>(
        ENDPOINTS.RECOMMENDATIONS.GET(leadId)
      );
      return res.data;
    },
    staleTime: 30_000,
    enabled: !!leadId,
  });
}

// ── Client-approved creators hook ─────────────────────────────────────────────

export interface ClientApprovedProfile {
  creator_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  niche?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  rate?: string | null;
  location?: string | null;
  instagram_handle?: string | null;
  instagram_followers?: number | null;
  instagram_following?: number | null;
  instagram_posts?: number | null;
  instagram_engagement_rate?: number | null;
  tiktok_handle?: string | null;
  tiktok_followers?: number | null;
  youtube_url?: string | null;
  follower_count?: number | null;
  engagement_rate?: number | null;
  is_verified?: boolean;
  is_business?: boolean;
  searchapi_data?: RecommendationCreator['searchapi_data'];
}

export interface ClientApprovedCreator {
  assignment_id: string;
  creator_id: string;
  status: string;
  source: string;
  added_at: string;
  client_decision_at: string | null;
  deal_status: string | null;
  deal_amount: number | null;
  profile: ClientApprovedProfile;
}

export interface ClientApprovedResponse {
  lead_id: string;
  brand_name: string;
  creators: ClientApprovedCreator[];
  total: number;
}

export function useClientApprovedCreators(leadId: string) {
  return useQuery<ClientApprovedResponse>({
    queryKey: ['client-approved-creators', leadId],
    queryFn: async () => {
      const res = await apiClient.get<ClientApprovedResponse>(
        ENDPOINTS.CAMPAIGN_INFLUENCERS.CLIENT_APPROVED(leadId)
      );
      return res.data;
    },
    staleTime: 30_000,
    enabled: !!leadId,
  });
}

export function useRecommendationDecision(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recommendationId,
      creatorId,
      decision,
    }: {
      recommendationId: string;
      creatorId: string;
      decision: 'accepted' | 'rejected';
    }) =>
      apiClient.patch(ENDPOINTS.RECOMMENDATIONS.DECISION(recommendationId), {
        creator_id: creatorId,
        decision,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recommendations', leadId] });
    },
  });
}
