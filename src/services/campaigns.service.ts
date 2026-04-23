import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  CampaignLead,
  CampaignDashboardStats,
  Questionnaire,
  CampaignMeeting,
  CampaignDocument,
  CampaignInfluencer,
  Influencer,
  ContentItem,
  ApprovalItem,
  InboxConversation,
  InboxMessage,
  CampaignManager,
  CampaignLeadStage,
  InfluencerStatus,
  DealStatus,
  ContentStatus,
} from '@/types/campaign.types';

export const campaignsService = {
  // Dashboard
  getDashboardStats: async (): Promise<CampaignDashboardStats> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.DASHBOARD_STATS);
    return data;
  },

  // Leads
  getLeads: async (params?: {
    search?: string;
    stage?: CampaignLeadStage;
    assignedTo?: string;
  }): Promise<CampaignLead[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.LIST, { params });
    return data;
  },

  getLeadDetail: async (id: string): Promise<CampaignLead> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.DETAIL(id));
    return data;
  },

  assignLead: async (id: string, campaignManagerId: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_LEADS.ASSIGN(id), { campaignManagerId });
  },

  updateStage: async (id: string, stage: CampaignLeadStage): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_LEADS.STAGE(id), { stage });
  },

  getTimeline: async (id: string): Promise<unknown[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.TIMELINE(id));
    return data;
  },

  // Campaign Managers
  getCampaignManagers: async (): Promise<CampaignManager[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_MANAGERS.LIST);
    return data;
  },

  // Questionnaire
  getQuestionnaire: async (leadId: string): Promise<Questionnaire> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.DETAIL(leadId));
    return data;
  },

  sendQuestionnaire: async (leadId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.SEND(leadId));
  },

  updateQuestionnaire: async (
    leadId: string,
    questions: Questionnaire['questions']
  ): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.UPDATE(leadId), { questions });
  },

  // Meeting
  getMeeting: async (leadId: string): Promise<CampaignMeeting> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_MEETINGS.DETAIL(leadId));
    return data;
  },

  scheduleMeeting: async (
    leadId: string,
    payload: { scheduledAt: string; inviteEmails: string[] }
  ): Promise<CampaignMeeting> => {
    const { data } = await apiClient.post(ENDPOINTS.CAMPAIGN_MEETINGS.SCHEDULE(leadId), payload);
    return data;
  },

  // Documents
  getDocuments: async (leadId: string): Promise<CampaignDocument[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_DOCUMENTS.LIST(leadId));
    return data;
  },

  updateDocument: async (leadId: string, docId: string, content: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_DOCUMENTS.UPDATE(leadId, docId), { content });
  },

  submitDocumentToAdmin: async (leadId: string, docId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.SUBMIT_TO_ADMIN(leadId, docId));
  },

  sendDocumentToClient: async (leadId: string, docId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.SEND_TO_CLIENT(leadId, docId));
  },

  // Influencers (global)
  getAllInfluencers: async (params?: {
    search?: string;
    platform?: string;
    niche?: string;
  }): Promise<Influencer[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.LIST, { params });
    return data;
  },

  // Lead influencers
  getLeadInfluencers: async (leadId: string): Promise<CampaignInfluencer[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.LEAD_LIST(leadId));
    return data;
  },

  addInfluencerToLead: async (leadId: string, influencerId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_INFLUENCERS.ADD_TO_LEAD(leadId), { influencerId });
  },

  updateInfluencerStatus: async (
    leadId: string,
    influencerId: string,
    status: InfluencerStatus
  ): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_STATUS(leadId, influencerId), {
      status,
    });
  },

  updateInfluencerDeal: async (
    leadId: string,
    influencerId: string,
    deal: { status: DealStatus; amount?: number; notes?: string }
  ): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_DEAL(leadId, influencerId), deal);
  },

  sendInfluencersToClient: async (leadId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_INFLUENCERS.SEND_TO_CLIENT(leadId));
  },

  // Content
  getContent: async (leadId: string): Promise<ContentItem[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_CONTENT.LIST(leadId));
    return data;
  },

  updateContentStatus: async (
    leadId: string,
    contentId: string,
    status: ContentStatus,
    note?: string
  ): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_CONTENT.UPDATE_STATUS(leadId, contentId), {
      status,
      note,
    });
  },

  scheduleContent: async (
    leadId: string,
    contentId: string,
    scheduledAt: string
  ): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_CONTENT.SCHEDULE(leadId, contentId), { scheduledAt });
  },

  // Inbox
  getConversations: async (): Promise<InboxConversation[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.CONVERSATIONS);
    return data;
  },

  getConversation: async (id: string): Promise<InboxConversation> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.CONVERSATION(id));
    return data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<InboxMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.CAMPAIGN_INBOX.SEND(conversationId), {
      content,
    });
    return data;
  },

  getLeadClientConversation: async (leadId: string): Promise<InboxConversation> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.LEAD_CLIENT(leadId));
    return data;
  },

  // Approvals
  getApprovals: async (): Promise<ApprovalItem[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_APPROVALS.LIST);
    return data;
  },

  approveItem: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.APPROVE(id));
  },

  rejectItem: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.REJECT(id), { reason });
  },
};
