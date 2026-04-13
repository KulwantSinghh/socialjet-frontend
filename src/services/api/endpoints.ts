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
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    CONVERT: (id: string) => `/leads/${id}/convert`,
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

  NOTIFICATIONS: {
    LIST: '/notifications',
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

  INTELLIGENCE: {
    CALLS: '/sales/intelligence/calls',
    REVIEW: (callId: string) => `/sales/intelligence/calls/${callId}/review`,
    MEETING_SUMMARY: '/sales/intelligence/meeting-summary',
    ANALYZE: '/sales/analyze',
    TRANSCRIPT: (meetingId: string) => `/meetings/${meetingId}/transcript`,
  },

  MEETINGS: {
    LIST: '/meetings/',
  },
} as const;
