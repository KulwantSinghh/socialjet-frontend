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

export function useLeadInfluencers(leadId: string) {
  return useQuery({
    queryKey: ['lead-influencers', leadId],
    queryFn: () => campaignsService.getLeadInfluencers(leadId),
    staleTime: 15_000,
    enabled: !!leadId,
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
