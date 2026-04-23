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
    LIST: '/campaign-leads',
    DETAIL: (id: string) => `/campaign-leads/${id}`,
    ASSIGN: (id: string) => `/campaign-leads/${id}/assign`,
    STAGE: (id: string) => `/campaign-leads/${id}/stage`,
    TIMELINE: (id: string) => `/campaign-leads/${id}/timeline`,
    DASHBOARD_STATS: '/campaign-leads/dashboard/stats',
  },

  CAMPAIGN_QUESTIONNAIRE: {
    DETAIL: (leadId: string) => `/campaign-leads/${leadId}/questionnaire`,
    SEND: (leadId: string) => `/campaign-leads/${leadId}/questionnaire/send`,
    UPDATE: (leadId: string) => `/campaign-leads/${leadId}/questionnaire`,
  },

  CAMPAIGN_MEETINGS: {
    DETAIL: (leadId: string) => `/campaign-leads/${leadId}/meeting`,
    SCHEDULE: (leadId: string) => `/campaign-leads/${leadId}/meeting/schedule`,
    CANCEL: (leadId: string) => `/campaign-leads/${leadId}/meeting/cancel`,
    TRANSCRIPT: (leadId: string) => `/campaign-leads/${leadId}/meeting/transcript`,
  },

  CAMPAIGN_DOCUMENTS: {
    LIST: (leadId: string) => `/campaign-leads/${leadId}/documents`,
    DETAIL: (leadId: string, docId: string) => `/campaign-leads/${leadId}/documents/${docId}`,
    UPDATE: (leadId: string, docId: string) => `/campaign-leads/${leadId}/documents/${docId}`,
    SUBMIT_TO_ADMIN: (leadId: string, docId: string) =>
      `/campaign-leads/${leadId}/documents/${docId}/submit`,
    SEND_TO_CLIENT: (leadId: string, docId: string) =>
      `/campaign-leads/${leadId}/documents/${docId}/send`,
  },

  CAMPAIGN_INFLUENCERS: {
    LIST: '/influencers',
    DETAIL: (id: string) => `/influencers/${id}`,
    LEAD_LIST: (leadId: string) => `/campaign-leads/${leadId}/influencers`,
    ADD_TO_LEAD: (leadId: string) => `/campaign-leads/${leadId}/influencers`,
    UPDATE_STATUS: (leadId: string, influencerId: string) =>
      `/campaign-leads/${leadId}/influencers/${influencerId}/status`,
    UPDATE_DEAL: (leadId: string, influencerId: string) =>
      `/campaign-leads/${leadId}/influencers/${influencerId}/deal`,
    SEND_TO_CLIENT: (leadId: string) => `/campaign-leads/${leadId}/influencers/send`,
  },

  CAMPAIGN_CONTENT: {
    LIST: (leadId: string) => `/campaign-leads/${leadId}/content`,
    SUBMIT: (leadId: string) => `/campaign-leads/${leadId}/content`,
    UPDATE_STATUS: (leadId: string, contentId: string) =>
      `/campaign-leads/${leadId}/content/${contentId}/status`,
    SCHEDULE: (leadId: string, contentId: string) =>
      `/campaign-leads/${leadId}/content/${contentId}/schedule`,
  },

  CAMPAIGN_INBOX: {
    CONVERSATIONS: '/campaign-inbox/conversations',
    CONVERSATION: (id: string) => `/campaign-inbox/conversations/${id}`,
    SEND: (id: string) => `/campaign-inbox/conversations/${id}/send`,
    LEAD_CLIENT: (leadId: string) => `/campaign-inbox/lead/${leadId}/client`,
  },

  CAMPAIGN_APPROVALS: {
    LIST: '/campaign-approvals',
    APPROVE: (id: string) => `/campaign-approvals/${id}/approve`,
    REJECT: (id: string) => `/campaign-approvals/${id}/reject`,
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

  WHATSAPP: {
    SEND: (leadId: string) => `/leads/${leadId}/whatsapp`,
  },
} as const;
