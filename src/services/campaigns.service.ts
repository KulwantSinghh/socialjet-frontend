import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  CampaignLead,
  CampaignDashboardStats,
  Questionnaire,
  CampaignMeeting,
  CampaignDocument,
  KolBrief,
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

// ── Field-mapping helpers ─────────────────────────────────────────────────────

function mapLead(raw: Record<string, unknown>): CampaignLead {
  return {
    id: (raw.lead_id ?? raw.id) as string,
    clientName: (raw.name ?? raw.contact_person ?? '') as string,
    clientEmail: (raw.email ?? '') as string,
    clientCompany: (raw.company ?? '') as string,
    stage: (raw.stage ?? 'unassigned') as CampaignLeadStage,
    priority: (raw.priority ?? 'medium') as CampaignLead['priority'],
    source: (raw.source ?? '') as string,
    createdAt: (raw.created_at ?? '') as string,
    updatedAt: (raw.updated_at ?? '') as string,
    stageUpdatedAt: (raw.stage_updated_at ?? raw.updated_at ?? '') as string,
    tags: raw.tags as string[] | undefined,
    assignedTo: raw.assigned_cm
      ? (raw.assigned_cm as CampaignManager)
      : raw.assigned_cm_id
        ? ({
            id: raw.assigned_cm_id as string,
            name: '',
            email: '',
            activeLeads: 0,
          } as CampaignManager)
        : undefined,
  };
}

function mapQuestionnaire(raw: Record<string, unknown>): Questionnaire {
  return {
    id: (raw.questionnaire_id ?? raw.id) as string,
    leadId: raw.lead_id as string,
    sentAt: raw.sent_at as string | undefined,
    receivedAt: raw.received_at as string | undefined,
    questions: (raw.questions as Questionnaire['questions']) ?? [],
  };
}

function mapDocument(raw: Record<string, unknown>): CampaignDocument {
  const docField = raw.document;
  const isObject = docField !== null && typeof docField === 'object' && !Array.isArray(docField);
  return {
    id: (raw.onboarding_id ?? raw.id) as string,
    leadId: raw.lead_id as string,
    type: (raw.doc_type ?? 'onboarding') as CampaignDocument['type'],
    content: isObject ? '' : ((docField ?? raw.content ?? '') as string),
    document: isObject ? (docField as CampaignDocument['document']) : undefined,
    status: (raw.status ?? 'draft') as CampaignDocument['status'],
    createdAt: (raw.created_at ?? '') as string,
    updatedAt: (raw.updated_at ?? '') as string,
  };
}

function mapInfluencer(raw: Record<string, unknown>): Influencer {
  return {
    id: (raw.creator_id ?? raw.id) as string,
    name: raw.name as string,
    handle: raw.handle as string,
    platform: raw.platform as Influencer['platform'],
    avatar: raw.avatar as string | undefined,
    followers: raw.followers as number,
    engagementRate: (raw.engagement_rate ?? raw.engagementRate ?? 0) as number,
    avgViews: raw.avg_views as number | undefined,
    niche: (raw.niche ?? []) as string[],
    location: raw.location as string | undefined,
    priceRange: raw.price_range as Influencer['priceRange'],
    isRecommended: raw.is_recommended as boolean | undefined,
  };
}

function mapCampaignInfluencer(raw: Record<string, unknown>): CampaignInfluencer {
  return {
    ...mapInfluencer(raw),
    id: (raw.creator_id ?? raw.id) as string,
    status: (raw.status ?? 'recommended') as InfluencerStatus,
    dealStatus: raw.deal_status as DealStatus | undefined,
    dealAmount: raw.deal_amount as number | undefined,
    dealNotes: raw.deal_notes as string | undefined,
    addedAt: (raw.added_at ?? '') as string,
  };
}

function mapContent(raw: Record<string, unknown>): ContentItem {
  return {
    id: (raw.content_id ?? raw.id) as string,
    influencerId: (raw.creator_id ?? '') as string,
    influencerName: (raw.creator_name ?? '') as string,
    influencerAvatar: raw.creator_avatar as string | undefined,
    platform: raw.platform as ContentItem['platform'],
    contentUrl: raw.content_url as string,
    thumbnail: raw.thumbnail as string | undefined,
    caption: raw.caption as string | undefined,
    status: (raw.status ?? 'pending') as ContentStatus,
    submittedAt: raw.submitted_at as string | undefined,
    cmApprovedAt: raw.cm_approved_at as string | undefined,
    clientApprovedAt: raw.client_approved_at as string | undefined,
    scheduledAt: raw.scheduled_at as string | undefined,
    cmNote: raw.cm_note as string | undefined,
    clientNote: raw.client_note as string | undefined,
  };
}

function mapConversation(raw: Record<string, unknown>): InboxConversation {
  return {
    id: (raw.lead_id ?? raw.id) as string,
    type: (raw.conversation_type ?? 'client') as InboxConversation['type'],
    participantName: (raw.name ?? raw.participantName ?? '') as string,
    participantAvatar: raw.participant_avatar as string | undefined,
    participantHandle: raw.participant_handle as string | undefined,
    lastMessage: (raw.last_message ?? '') as string,
    lastMessageAt: (raw.last_message_at ?? '') as string,
    unreadCount: (raw.unread_count ?? 0) as number,
    leadId: raw.lead_id as string | undefined,
    messages: (raw.messages ?? []) as InboxMessage[],
  };
}

function mapApproval(raw: Record<string, unknown>): ApprovalItem {
  return {
    id: raw.id as string,
    leadId: raw.lead_id as string,
    leadName: raw.lead_name as string,
    clientCompany: (raw.client_company ?? '') as string,
    type: raw.type as ApprovalItem['type'],
    description: raw.description as string,
    status: (raw.status ?? 'pending') as ApprovalItem['status'],
    createdAt: raw.created_at as string,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

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
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.LIST, {
      params: { status: 'closed', ...params },
    });
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.leads ?? []);
    return list.map(mapLead);
  },

  getLeadDetail: async (id: string): Promise<CampaignLead> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.DETAIL(id));
    return mapLead(data as Record<string, unknown>);
  },

  assignLead: async (id: string, campaignManagerId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_LEADS.ASSIGN(id), { cm_user_id: campaignManagerId });
  },

  updateStage: async (id: string, stage: CampaignLeadStage): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_LEADS.STAGE(id), { stage });
  },

  getTimeline: async (id: string): Promise<unknown[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_LEADS.TIMELINE(id));
    return Array.isArray(data) ? data : (data.timeline ?? []);
  },

  // Campaign Managers
  getCampaignManagers: async (): Promise<CampaignManager[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_MANAGERS.LIST);
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.managers ?? []);
    return list.map((m) => ({
      id: m.id as string,
      name: m.name as string,
      email: m.email as string,
      avatar: m.avatar as string | undefined,
      activeLeads: (m.activeLeads ?? m.active_leads ?? 0) as number,
    }));
  },

  // Questionnaire
  getQuestionnaire: async (leadId: string): Promise<Questionnaire> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.DETAIL(leadId));
    return mapQuestionnaire(data as Record<string, unknown>);
  },

  sendQuestionnaire: async (leadId: string, htmlContent?: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.SEND(leadId), {
      html_content: htmlContent ?? null,
    });
  },

  markQuestionnaireReceived: async (leadId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_QUESTIONNAIRE.MARK_RECEIVED(leadId));
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
    const raw = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
    return {
      id: (raw.meeting_id ?? raw.id) as string,
      leadId: (raw.lead_id ?? leadId) as string,
      zoomLink: (raw.zoom_join_url ?? raw.zoom_link) as string | undefined,
      scheduledAt: (raw.scheduled_at ?? raw.scheduledAt) as string | undefined,
      duration: Number(raw.duration_minutes ?? raw.duration ?? 60),
      status: (raw.meeting_status ?? raw.status ?? 'scheduled') as CampaignMeeting['status'],
      transcriptUrl: raw.transcript_url as string | undefined,
      reportUrl: raw.report_url as string | undefined,
    };
  },

  scheduleMeeting: async (
    leadId: string,
    payload: { scheduledAt: string; inviteEmails: string[]; durationMinutes?: number }
  ): Promise<CampaignMeeting> => {
    const { data } = await apiClient.post(ENDPOINTS.CAMPAIGN_MEETINGS.SCHEDULE(leadId), {
      lead_id: leadId,
      scheduled_at: payload.scheduledAt,
      invite_emails: payload.inviteEmails,
      duration_minutes: payload.durationMinutes ?? 60,
    });
    return data as CampaignMeeting;
  },

  // Documents
  getDocuments: async (leadId: string): Promise<CampaignDocument[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_DOCUMENTS.LIST(leadId));
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.documents ?? []);
    return list.map(mapDocument);
  },

  updateDocument: async (leadId: string, docId: string, content: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.CAMPAIGN_DOCUMENTS.UPDATE(leadId, docId), {
      document: content,
    });
  },

  submitDocumentToAdmin: async (leadId: string, docId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.SUBMIT_TO_ADMIN(leadId, docId));
  },

  sendDocumentToClient: async (leadId: string, docId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.SEND_TO_CLIENT(leadId, docId));
  },

  generateOnboarding: async (
    leadId: string,
    meetingId?: string,
    notes?: string
  ): Promise<CampaignDocument> => {
    const { data } = await apiClient.post(
      ENDPOINTS.CAMPAIGN_DOCUMENTS.GENERATE_ONBOARDING,
      {
        lead_id: leadId,
        ...(meetingId ? { meeting_id: meetingId } : {}),
        ...(notes ? { notes } : {}),
      },
      { timeout: 120_000 }
    );
    const raw = data as Record<string, unknown>;
    return {
      id: (raw.onboarding_id ?? raw.id) as string,
      leadId: (raw.lead_id ?? leadId) as string,
      type: 'onboarding',
      content: '',
      document: raw.document as CampaignDocument['document'],
      status: (raw.status ?? 'draft') as CampaignDocument['status'],
      createdAt: (raw.created_at ?? '') as string,
      updatedAt: (raw.updated_at ?? '') as string,
    };
  },

  generateKolBrief: async (leadId: string, productName?: string): Promise<KolBrief> => {
    const { data } = await apiClient.post(
      ENDPOINTS.CAMPAIGN_DOCUMENTS.KOL_BRIEF_GENERATE,
      {
        lead_id: leadId,
        ...(productName ? { product_name: productName } : {}),
      },
      { timeout: 120_000 }
    );
    const raw = data as Record<string, unknown>;
    return {
      id: (raw.brief_id ?? raw.id) as string,
      campaignId: (raw.campaign_id ?? '') as string,
      leadId: (raw.lead_id ?? leadId) as string,
      status: (raw.status ?? 'draft') as KolBrief['status'],
      document: raw.document as KolBrief['document'],
      createdAt: (raw.created_at ?? '') as string,
    };
  },

  getKolBrief: async (leadId: string): Promise<KolBrief | null> => {
    try {
      const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_DOCUMENTS.KOL_BRIEF_DETAIL(leadId));
      const raw = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
      if (!raw) return null;
      return {
        id: (raw.brief_id ?? raw.id) as string,
        campaignId: (raw.campaign_id ?? '') as string,
        leadId: (raw.lead_id ?? leadId) as string,
        status: (raw.status ?? 'draft') as KolBrief['status'],
        document: raw.document as KolBrief['document'],
        createdAt: (raw.created_at ?? '') as string,
      };
    } catch {
      return null;
    }
  },

  submitKolBrief: async (briefId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.KOL_BRIEF_SUBMIT(briefId));
  },

  // Influencers (global)
  getAllInfluencers: async (params?: {
    search?: string;
    platform?: string;
    niche?: string;
  }): Promise<Influencer[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.LIST, { params });
    const list: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : (data.creators ?? data.influencers ?? []);
    return list.map(mapInfluencer);
  },

  // Lead influencers
  getLeadInfluencers: async (leadId: string): Promise<CampaignInfluencer[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INFLUENCERS.LEAD_LIST(leadId));
    const list: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : (data.creators ?? data.influencers ?? []);
    return list.map(mapCampaignInfluencer);
  },

  addInfluencerToLead: async (leadId: string, influencerId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_INFLUENCERS.ADD_TO_LEAD(leadId), {
      creator_id: influencerId,
      is_recommended: false,
    });
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
    await apiClient.patch(ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_DEAL(leadId, influencerId), {
      deal_status: deal.status,
      deal_amount: deal.amount,
      deal_notes: deal.notes,
    });
  },

  sendInfluencersToClient: async (leadId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_INFLUENCERS.SEND_TO_CLIENT(leadId));
  },

  // Content
  getContent: async (leadId: string): Promise<ContentItem[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_CONTENT.LIST(leadId));
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
    return list.map(mapContent);
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
    await apiClient.patch(ENDPOINTS.CAMPAIGN_CONTENT.SCHEDULE(leadId, contentId), {
      scheduled_at: scheduledAt,
    });
  },

  // Inbox
  getConversations: async (): Promise<InboxConversation[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.CONVERSATIONS, {
      params: { context: 'campaign' },
    });
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.conversations ?? []);
    return list.map(mapConversation);
  },

  getConversation: async (id: string): Promise<InboxConversation> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.CONVERSATION(id));
    return mapConversation(data as Record<string, unknown>);
  },

  sendMessage: async (conversationId: string, content: string): Promise<InboxMessage> => {
    const { data } = await apiClient.post(ENDPOINTS.CAMPAIGN_INBOX.SEND(conversationId), {
      content,
    });
    return data as InboxMessage;
  },

  getLeadClientConversation: async (leadId: string): Promise<InboxConversation> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_INBOX.LEAD_CLIENT(leadId));
    return mapConversation(data as Record<string, unknown>);
  },

  // Approvals
  getApprovals: async (): Promise<ApprovalItem[]> => {
    const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_APPROVALS.LIST);
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.approvals ?? []);
    return list.map(mapApproval);
  },

  approveItem: async (id: string, type?: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.APPROVE(id), undefined, {
      params: type ? { type } : undefined,
    });
  },

  rejectItem: async (id: string, reason?: string, type?: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.REJECT(id), reason ? { reason } : undefined, {
      params: type ? { type } : undefined,
    });
  },
};
