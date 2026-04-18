import type { SalesAnalysis } from './intelligence.types';

export type ProposalStatus = 'pending_approval' | 'approved' | 'sent' | string;

export interface Proposal {
  proposal_id: string;
  meeting_id: string;
  lead_id: string;
  lead_name?: string;
  lead_company?: string;
  content: SalesAnalysis;
  status: ProposalStatus;
  review_notes?: string;
  generated_at: string;
  approved_by?: string;
  approved_at?: string;
  sent_at?: string;
  sent_to_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalsListResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApproveProposalRequest {
  review_notes?: string;
}

export interface ApproveProposalResponse {
  proposal_id: string;
  status: 'approved';
  approved_by: string;
  approved_at: string;
}

export interface SendProposalRequest {
  recipient_email?: string;
}

export interface SendProposalResponse {
  proposal_id: string;
  status: 'sent';
  sent_to: string;
  sent_at: string;
}
