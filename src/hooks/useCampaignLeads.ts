import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/services/campaigns.service';
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
  params?: { batch_number?: number; status?: string }
) {
  return useQuery({
    queryKey: ['shortlist', campaignId, params],
    queryFn: () => campaignsService.getShortlist(campaignId, params),
    staleTime: 15_000,
    enabled: !!campaignId,
  });
}

export function useShortlistStats(campaignId: string) {
  return useQuery({
    queryKey: ['shortlist-stats', campaignId],
    queryFn: () => campaignsService.getShortlistStats(campaignId),
    staleTime: 15_000,
    enabled: !!campaignId,
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

export function useLeadContent(leadId: string) {
  return useQuery({
    queryKey: ['lead-content', leadId],
    queryFn: () => campaignsService.getContent(leadId),
    staleTime: 10_000,
    enabled: !!leadId,
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
