import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/services/campaigns.service';
import { useClientApprovedCreators } from '@/hooks/useCampaignLeads';
import type {
  ContentItem,
  ContentLinkInput,
  SendScheduleEmailsPayload,
} from '@/types/campaign.types';

export const contentLinksKeys = {
  all: (leadId: string) => ['content-links', leadId] as const,
  creator: (leadId: string, creatorId: string) => ['content-links', leadId, creatorId] as const,
};

// Links land asynchronously (creator emails them, CM pastes them), so poll to
// keep the list in sync while the screen is open.
const POLL_INTERVAL = 10_000;

export function useCreatorContentLinks(leadId: string, creatorId: string) {
  return useQuery({
    queryKey: contentLinksKeys.creator(leadId, creatorId),
    queryFn: () => campaignsService.getContentLinks(leadId, creatorId),
    enabled: !!leadId && !!creatorId,
    staleTime: 5_000,
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

/**
 * All content links for a lead, merged across its client-approved creators.
 * The links API is per-creator, so this fans out one query per creator and
 * flattens the results, filling in creator names from the roster.
 */
export function useLeadContentLinks(leadId: string) {
  const creatorsQuery = useClientApprovedCreators(leadId);
  const creators = creatorsQuery.data?.creators ?? [];

  const linkQueries = useQueries({
    queries: creators.map((c) => ({
      queryKey: contentLinksKeys.creator(leadId, c.creator_id),
      queryFn: () => campaignsService.getContentLinks(leadId, c.creator_id),
      staleTime: 5_000,
      refetchInterval: POLL_INTERVAL,
    })),
  });

  const links: ContentItem[] = linkQueries.flatMap((query, i) =>
    (query.data ?? []).map((item) => ({
      ...item,
      influencerName: item.influencerName || creators[i].profile?.name || 'Creator',
      influencerAvatar: item.influencerAvatar ?? creators[i].profile?.profile_image ?? undefined,
    }))
  );

  return {
    links,
    creatorsCount: creators.length,
    isLoading: creatorsQuery.isLoading || linkQueries.some((q) => q.isLoading),
    isError: creatorsQuery.isError,
  };
}

export function useSubmitContentLinks(leadId: string, creatorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (links: ContentLinkInput[]) =>
      campaignsService.submitContentLinks(leadId, creatorId, links),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentLinksKeys.creator(leadId, creatorId) });
    },
  });
}

export function useCmReviewContentLink(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      status,
      note,
    }: {
      contentId: string;
      status: 'cm_approved' | 'cm_rejected';
      note?: string;
    }) => campaignsService.cmReviewContentLink(leadId, contentId, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentLinksKeys.all(leadId) });
    },
  });
}

export function useSendScheduleEmails(leadId: string) {
  return useMutation({
    mutationFn: (payload: SendScheduleEmailsPayload) =>
      campaignsService.sendScheduleEmails(leadId, payload),
  });
}
