import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  NurtureDashboardResponse,
  NurturePeriod,
  NurtureDetailResponse,
  NurtureEmailHistoryResponse,
  NurtureEmail,
  EmailDraftRequest,
  EmailApproveRequest,
} from '@/types/nurture.types';

export const nurtureService = {
  getDashboard: async (period: NurturePeriod = 'week'): Promise<NurtureDashboardResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NURTURE.DASHBOARD, { params: { period } });
    return data;
  },

  getDetail: async (leadId: string): Promise<NurtureDetailResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.NURTURE.DETAIL(leadId));
    return data;
  },

  // ---- Email Nurture ----

  getEmailHistory: async (leadId: string): Promise<NurtureEmailHistoryResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.EMAIL_NURTURE.HISTORY(leadId));
    return data;
  },

  generateDraft: async (leadId: string, customInstructions?: string): Promise<NurtureEmail> => {
    const { data } = await apiClient.post(ENDPOINTS.EMAIL_NURTURE.DRAFT(leadId), {
      custom_instructions: customInstructions ?? '',
    });
    // API returns { email_id, status, message, draft: { ...NurtureEmail } }
    return (data.draft ?? data) as NurtureEmail;
  },

  approveEmail: async (emailId: string, edits?: EmailApproveRequest): Promise<NurtureEmail> => {
    const { data } = await apiClient.post(ENDPOINTS.EMAIL_NURTURE.APPROVE(emailId), edits ?? {});
    return (data.email ?? data) as NurtureEmail;
  },

  deleteEmailDraft: async (emailId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.EMAIL_NURTURE.DELETE(emailId));
  },

  updateDraft: async (emailId: string, edits: EmailDraftRequest): Promise<NurtureEmail> => {
    const { data } = await apiClient.patch(ENDPOINTS.EMAIL_NURTURE.DETAIL(emailId), edits);
    return data;
  },
};
