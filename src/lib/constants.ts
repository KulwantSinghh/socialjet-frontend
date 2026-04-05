/**
 * Application-wide constants.
 */

export const APP_NAME = 'SocialJet CRM';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const AUTH_TOKEN_KEY = 'socialjet_access_token';
export const REFRESH_TOKEN_KEY = 'socialjet_refresh_token';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  SALES_DASHBOARD: '/sales',
  SALES_LEADS: '/sales/leads',
  SALES_PIPELINE: '/sales/pipeline',
  SALES_REPORTS: '/sales/reports',

  CAMPAIGNS_DASHBOARD: '/campaigns',
  CAMPAIGNS_CREATE: '/campaigns/create',
  CAMPAIGNS_ANALYTICS: '/campaigns/analytics',
  CAMPAIGNS_TEMPLATES: '/campaigns/templates',

  FINANCE_DASHBOARD: '/finance',
  FINANCE_INVOICES: '/finance/invoices',
  FINANCE_BILLING: '/finance/billing',
  FINANCE_REPORTS: '/finance/reports',

  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_SETTINGS: '/admin/settings',

  CLIENT_DASHBOARD: '/client',

  SHARED_PROFILE: '/shared/profile',
  SHARED_NOTIFICATIONS: '/shared/notifications',
} as const;
