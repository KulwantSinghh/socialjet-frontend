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
  },

  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  LEADS: {
    LIST: '/leads',
    DETAIL: (id: string) => `/leads/${id}`,
    CREATE: '/leads',
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    CONVERT: (id: string) => `/leads/${id}/convert`,
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
} as const;
