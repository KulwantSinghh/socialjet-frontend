'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsService } from '@/services/proposals.service';
import type {
  ProposalStatus,
  ApproveProposalRequest,
  SendProposalRequest,
} from '@/types/proposals.types';
import type { SalesAnalysis } from '@/types/intelligence.types';

export const PROPOSALS_QUERY_KEY = 'proposals';

export function useProposals(params?: { status?: ProposalStatus; lead_id?: string }) {
  return useQuery({
    queryKey: [PROPOSALS_QUERY_KEY, params],
    queryFn: () => proposalsService.getProposals(params),
    staleTime: 30_000,
  });
}

export function useProposal(proposalId: string | undefined) {
  return useQuery({
    queryKey: [PROPOSALS_QUERY_KEY, proposalId],
    queryFn: () => proposalsService.getProposal(proposalId!),
    enabled: !!proposalId,
    staleTime: 60_000,
  });
}

export function useApproveProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      payload,
    }: {
      proposalId: string;
      payload?: ApproveProposalRequest;
    }) => proposalsService.approveProposal(proposalId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
    },
  });
}

export function useSendProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, payload }: { proposalId: string; payload?: SendProposalRequest }) =>
      proposalsService.sendProposal(proposalId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      content,
    }: {
      proposalId: string;
      content: Partial<SalesAnalysis>;
    }) => proposalsService.updateProposal(proposalId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PROPOSALS_QUERY_KEY] });
    },
  });
}
