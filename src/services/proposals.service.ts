import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  Proposal,
  ProposalStatus,
  ProposalsListResponse,
  ApproveProposalRequest,
  ApproveProposalResponse,
  SendProposalRequest,
  SendProposalResponse,
} from '@/types/proposals.types';
import type { SalesAnalysis } from '@/types/intelligence.types';

export const proposalsService = {
  getProposals: async (params?: {
    status?: ProposalStatus;
    lead_id?: string;
    page?: number;
    page_size?: number;
  }): Promise<ProposalsListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.PROPOSALS.LIST, { params });
    return data;
  },

  getProposal: async (proposalId: string): Promise<Proposal> => {
    const { data } = await apiClient.get(ENDPOINTS.PROPOSALS.DETAIL(proposalId));
    return data;
  },

  updateProposal: async (
    proposalId: string,
    content: Partial<SalesAnalysis>
  ): Promise<Proposal> => {
    const { data } = await apiClient.patch(ENDPOINTS.PROPOSALS.UPDATE(proposalId), { content });
    return data;
  },

  approveProposal: async (
    proposalId: string,
    payload?: ApproveProposalRequest
  ): Promise<ApproveProposalResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.PROPOSALS.APPROVE(proposalId), payload ?? {});
    return data;
  },

  sendProposal: async (
    proposalId: string,
    payload?: SendProposalRequest
  ): Promise<SendProposalResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.PROPOSALS.SEND(proposalId), payload ?? {});
    return data;
  },
};
