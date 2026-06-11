/**
 * Centralized API endpoint definitions.
 * ALL API URLs are defined here — never hardcode URLs elsewhere.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD_REQUEST: '/auth/forgot-password/request',
    FORGOT_PASSWORD_VERIFY: '/auth/forgot-password/verify',
    FORGOT_PASSWORD_RESET: '/auth/forgot-password/reset',
    ME: '/auth/me',
    CREATE_USER: '/auth/users',
  },

  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  ADMIN: {
    USERS: '/admin/users',
    USER_DELETE: (id: string) => `/admin/users/${id}`,
  },

  LEADS: {
    LIST: '/leads/',
    DETAIL: (id: string) => `/leads/${id}`,
    CREATE: '/leads/',
    WEBFORM: '/leads/webform',
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    CONVERT: (id: string) => `/leads/${id}/convert`,
    STATUS: (id: string) => `/leads/${id}/status`,
    TIMELINE: (id: string) => `/leads/${id}/timeline`,
    MEETINGS: (id: string) => `/leads/${id}/meetings`,
    MARK_DEAD: (id: string) => `/leads/${id}/dead`,
    SEQUENCE_PAUSE: (id: string) => `/leads/${id}/sequence/pause`,
    SEQUENCE_RESUME: (id: string) => `/leads/${id}/sequence/resume`,
    ALERTS: '/leads/alerts',
    STATS: '/leads/stats',
    FUNNEL: '/leads/funnel',
  },

  PIPELINE: {
    LIST: '/pipeline',
    STAGES: '/pipeline/stages',
    MOVE: (dealId: string) => `/pipeline/${dealId}/move`,
  },

  CAMPAIGNS: {
    LIST: '/campaigns',
    DETAIL: (id: string) => `/campaigns/${id}`,
    CREATE: '/campaigns',
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    ANALYTICS: (id: string) => `/campaigns/${id}/analytics`,
  },

  CAMPAIGN_LEADS: {
    LIST: '/leads/',
    DETAIL: (id: string) => `/leads/${id}`,
    ASSIGN: (id: string) => `/leads/${id}/assign-cm`,
    STAGE: (id: string) => `/leads/${id}/stage`,
    TIMELINE: (id: string) => `/leads/${id}/timeline`,
    DASHBOARD_STATS: '/campaigns/dashboard',
  },

  CAMPAIGN_QUESTIONNAIRE: {
    DETAIL: (leadId: string) => `/questionnaire/${leadId}`,
    SEND: (leadId: string) => `/questionnaire/${leadId}/send`,
    UPDATE: (leadId: string) => `/questionnaire/${leadId}`,
    MARK_RECEIVED: (leadId: string) => `/questionnaire/${leadId}/mark-received`,
  },

  CAMPAIGN_MEETINGS: {
    DETAIL: (leadId: string) => `/meetings/onboarding/${leadId}`,
    SCHEDULE: (_leadId: string) => `/meetings/onboarding`,
    CANCEL: (leadId: string) => `/meetings/${leadId}/cancel`,
    TRANSCRIPT: (leadId: string) => `/meetings/${leadId}/transcript`,
  },

  CAMPAIGN_DOCUMENTS: {
    LIST: (leadId: string) => `/onboarding/${leadId}`,
    DETAIL: (_leadId: string, docId: string) => `/onboarding/${docId}`,
    UPDATE: (_leadId: string, docId: string) => `/onboarding/${docId}`,
    SUBMIT_TO_ADMIN: (_leadId: string, docId: string) => `/onboarding/${docId}/submit`,
    SEND_TO_CLIENT: (_leadId: string, docId: string) => `/onboarding/${docId}/send-to-client`,
    GENERATE_ONBOARDING: '/onboarding/generate',
    KOL_BRIEF_GENERATE: '/kol-brief/generate',
    KOL_BRIEF_DETAIL: (leadId: string) => `/kol-brief/${leadId}`,
    KOL_BRIEF_UPDATE: (briefId: string) => `/kol-brief/${briefId}`,
    KOL_BRIEF_SUBMIT: (briefId: string) => `/kol-brief/${briefId}/submit`,
    ONBOARDING_SEND_PDF: (leadId: string) => `/onboarding/${leadId}/send-pdf`,
    KOL_BRIEF_SEND_PDF: (leadId: string) => `/kol-brief/${leadId}/send-pdf`,
  },

  SHORTLISTS: {
    BUDGET_PREVIEW: (campaignId: string) => `/shortlists/${campaignId}/budget-preview`,
    RUN_DISCOVERY: (campaignId: string) => `/shortlists/${campaignId}`,
    GET: (campaignId: string) => `/shortlists/${campaignId}`,
    UPDATE_ENTRY: (campaignId: string, entryId: string) => `/shortlists/${campaignId}/${entryId}`,
    NEXT_BATCH: (campaignId: string) => `/shortlists/${campaignId}/next-batch`,
    STATS: (campaignId: string) => `/shortlists/${campaignId}/stats`,
    PHASE_TRANSITION: (campaignId: string) => `/campaigns/${campaignId}/phase`,
  },

  CAMPAIGN_INFLUENCERS: {
    LIST: '/creators/',
    DETAIL: (id: string) => `/creators/${id}`,
    LEAD_LIST: (leadId: string) => `/campaign-creators/${leadId}`,
    ADD_TO_LEAD: (leadId: string) => `/campaign-creators/${leadId}`,
    UPDATE_STATUS: (leadId: string, creatorId: string) =>
      `/campaign-creators/${leadId}/${creatorId}/status`,
    UPDATE_DEAL: (leadId: string, creatorId: string) =>
      `/campaign-creators/${leadId}/${creatorId}/deal`,
    SEND_TO_CLIENT: (leadId: string) => `/campaign-creators/${leadId}/send-to-client`,
    CLIENT_APPROVED: (leadId: string) => `/campaign-creators/${leadId}/client-approved`,
    DEAL_DETAILS: (leadId: string) => `/campaign-creators/${leadId}/deal-details`,
  },

  CAMPAIGN_CONTENT: {
    LIST: (leadId: string) => `/content/${leadId}`,
    SUBMIT: (leadId: string) => `/content/${leadId}`,
    UPDATE_STATUS: (leadId: string, contentId: string) => `/content/${leadId}/${contentId}/status`,
    SCHEDULE: (leadId: string, contentId: string) => `/content/${leadId}/${contentId}/schedule`,
  },

  CAMPAIGN_INBOX: {
    CONVERSATIONS: '/inbox/',
    CONVERSATION: (id: string) => `/inbox/${id}`,
    SEND: (id: string) => `/inbox/${id}/send`,
    LEAD_CLIENT: (leadId: string) => `/inbox/${leadId}`,
  },

  CAMPAIGN_APPROVALS: {
    LIST: '/campaign-approvals',
    APPROVE: (id: string) => `/campaign-approvals/${id}/approve`,
    REJECT: (id: string) => `/campaign-approvals/${id}/reject`,
    APPROVE_DOCUMENT: (id: string) => `/campaign-approvals/${id}/approve?type=document`,
    REJECT_DOCUMENT: (id: string) => `/campaign-approvals/${id}/reject?type=document`,
    PENDING_DOCUMENTS: '/onboarding/pending-approvals',
  },

  CAMPAIGN_MANAGERS: {
    LIST: '/campaign-managers',
  },

  TEMPLATES: {
    LIST: '/templates',
    DETAIL: (id: string) => `/templates/${id}`,
    CREATE: '/templates',
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
  },

  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id: string) => `/invoices/${id}`,
    CREATE: '/invoices',
    UPDATE: (id: string) => `/invoices/${id}`,
    DELETE: (id: string) => `/invoices/${id}`,
  },

  NURTURE: {
    DASHBOARD: '/nurture/dashboard',
    DETAIL: (leadId: string) => `/nurture/${leadId}/detail`,
    SEQUENCES: '/nurture/sequences',
    AGENTS: '/nurture/agents',
    AGENT_DETAIL: (id: string) => `/nurture/agents/${id}`,
    STATS: '/nurture/stats',
    REPLY: (id: string) => `/nurture/agents/${id}/reply`,
  },

  EMAIL_NURTURE: {
    DRAFT: (leadId: string) => `/email/nurture/${leadId}/draft`,
    APPROVE: (emailId: string) => `/email/nurture/emails/${emailId}/approve`,
    APPROVAL_QUEUE: '/email/nurture/approval-queue',
    HISTORY: (leadId: string) => `/email/nurture/${leadId}/history`,
    LIST: '/email/nurture/emails',
    DETAIL: (emailId: string) => `/email/nurture/emails/${emailId}`,
    DELETE: (emailId: string) => `/email/nurture/emails/${emailId}`,
  },

  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  REPORTS: {
    SALES: '/reports/sales',
    CAMPAIGNS: '/reports/campaigns',
    FINANCE: '/reports/finance',
  },

  SALES: {
    VELOCITY: '/sales/velocity',
    ACTIVITY: '/sales/activity',
    DASHBOARD: '/sales/dashboard',
  },

  APPROVALS: {
    PENDING: '/sales/intelligence/calls',
    APPROVE: (callId: string) => `/sales/intelligence/proposals/${callId}/approve`,
    REJECT: (callId: string) => `/sales/intelligence/proposals/${callId}/reject`,
    SEND_EMAIL: (callId: string) => `/sales/intelligence/proposals/${callId}/send-email`,
  },

  INTELLIGENCE: {
    CALLS: '/sales/intelligence/calls',
    STATS: '/sales/intelligence/stats',
    REVIEW: (callId: string) => `/sales/intelligence/calls/${callId}/review`,
    MEETING_SUMMARY: '/sales/intelligence/meeting-summary',
    ANALYZE: '/sales/intelligence/analyze',
    TRANSCRIPT: (meetingId: string) => `/meetings/${meetingId}/transcript`,
    REPORT: (meetingId: string) => `/meetings/${meetingId}/report`,
    REGENERATE_REPORT: (meetingId: string) => `/meetings/${meetingId}/report/regenerate`,
    PROPOSAL_BY_MEETING: (meetingId: string) =>
      `/sales/intelligence/proposals/by-meeting/${meetingId}`,
    UPDATE_PROPOSAL: (callId: string) => `/sales/intelligence/proposals/${callId}`,
    SUBMIT_PROPOSAL: (callId: string) => `/sales/intelligence/proposals/${callId}/submit`,
  },

  MEETINGS: {
    LIST: '/meetings/',
    DETAIL: (id: string) => `/meetings/${id}`,
    INSTANT: '/meetings/instant',
    TRANSCRIPT: (id: string) => `/meetings/${id}/transcript`,
    REPORT: (id: string) => `/meetings/${id}/report`,
    RESCHEDULE: (id: string) => `/meetings/${id}/reschedule`,
    CANCEL: (id: string) => `/meetings/${id}/cancel`,
    CHECK_AVAILABILITY: '/meetings/check-availability',
  },

  MEETING_REQUESTS: {
    LIST: '/meeting-requests',
    CONFIRM: (id: string) => `/meeting-requests/${id}/confirm`,
    DECLINE: (id: string) => `/meeting-requests/${id}/decline`,
  },

  PROPOSALS: {
    LIST: '/proposals',
    DETAIL: (id: string) => `/proposals/${id}`,
    UPDATE: (id: string) => `/proposals/${id}`,
    APPROVE: (id: string) => `/proposals/${id}/approve`,
    SEND: (id: string) => `/proposals/${id}/send`,
  },

  INBOX: {
    LIST: '/inbox',
    CONVERSATION: (leadId: string) => `/inbox/${leadId}`,
    SEND: (leadId: string) => `/inbox/${leadId}/send`,
    PAUSE_AUTOMATION: (leadId: string) => `/inbox/${leadId}/automation/pause`,
    RESUME_AUTOMATION: (leadId: string) => `/inbox/${leadId}/automation/resume`,
  },

  OUTREACH: {
    // Inbox + threads
    INBOX: '/outreach/inbox',
    SYNC_REPLIES: '/outreach/sync-replies',
    THREAD: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}`,
    EMAIL_THREAD: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}/thread`,
    REPLY: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}/reply`,
    LEAD_MESSAGES: (leadId: string) => `/outreach/${leadId}`,
    // Draft lifecycle
    APPROVE: (messageId: string) => `/outreach/messages/${messageId}/approve`,
    REJECT: (messageId: string) => `/outreach/messages/${messageId}/reject`,
    SEND: (messageId: string) => `/outreach/messages/${messageId}/send`,
    // CM actions on a thread
    COMPOSE: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}/compose`,
    NEGOTIATE: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}/negotiate`,
    SEND_BRIEF: (leadId: string, creatorId: string) =>
      `/outreach/${leadId}/${creatorId}/send-brief`,
    GENERATE: (leadId: string, creatorId: string) => `/outreach/${leadId}/${creatorId}/generate`,
    GENERATE_BULK: (leadId: string) => `/outreach/${leadId}/generate-bulk`,
    // Aggregates
    ANALYTICS: (leadId: string) => `/outreach/${leadId}/analytics`,
    NEGOTIATION_SUMMARY: (leadId: string) => `/outreach/${leadId}/negotiation-summary`,
    // Status / opt-in
    OPT_IN: (leadId: string, creatorId: string) => `/outreach/opt-in/${leadId}/${creatorId}`,
    NEGOTIATION_STATUS: (leadId: string, creatorId: string) =>
      `/outreach/negotiation/${leadId}/${creatorId}`,
  },

  WHATSAPP: {
    SEND: (leadId: string) => `/leads/${leadId}/whatsapp`,
  },

  RECOMMENDATIONS: {
    GET: (leadId: string) => `/recommendations/${leadId}`,
    DECISION: (recommendationId: string) => `/recommendations/${recommendationId}/decision`,
  },
} as const;
