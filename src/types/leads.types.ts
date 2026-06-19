export type LeadSource = 'whatsapp' | 'contact_form' | string;
export type LeadStatus = 'new' | 'proposal' | 'qualified' | 'closed' | string;
export type ConversationStatus = 'active_conversation' | 'closed' | string;

export interface LeadAlert {
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  conversation_status?: ConversationStatus;
  created_at: string;
  updated_at: string;
  notes?: string;
  message?: string;
  company?: string;
  created_by?: string;
  last_nurture_at?: string;
  last_nurture_message?: string;
}

export interface LeadAlertsResponse {
  alerts: LeadAlert[];
  count: number;
}

// ---- Lead Velocity ----

export type VelocityPeriod = 'day' | 'week' | 'month';

export interface VelocityDay {
  new_leads: number;
  qualified: number;
  proposals: number;
}

export interface VelocityResponse {
  period: VelocityPeriod;
  velocity: Record<string, VelocityDay>;
}

export interface ChartDataPoint {
  name: string;
  newLeads: number;
  qualified: number;
  proposals: number;
}

// ---- Lead Stats ----

export interface LeadStatsBySource {
  calendly: number;
  contact_form: number;
  whatsapp: number;
  manual: number;
  [key: string]: number;
}

export interface LeadStatsByStatus {
  canceled: number;
  new: number;
  proposal: number;
  contacted: number;
  onboarding: number;
  [key: string]: number;
}

export interface LeadStatsResponse {
  total_leads: number;
  by_source: LeadStatsBySource;
  by_status: LeadStatsByStatus;
  converted: number;
}

// ---- Lead List ----

export interface Lead {
  lead_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  pipeline_status?: string;
  notes?: string;
  deal_value?: string | number;
  contact_person?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  conversation_status?: ConversationStatus;
  last_nurture_at?: string;
  last_nurture_message?: string;
  message?: string;
  meeting_link?: string;
  reschedule_link?: string;
  flagged?: boolean;
  flag_reason?: string;
  [key: string]: unknown;
}

export interface LeadsListParams {
  search?: string;
  status?: string;
  source?: string;
}

export interface LeadsListResponse {
  leads: Lead[];
  count?: number;
}

// ---- Create Lead ----

export interface CreateLeadRequest {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: 'manual' | 'whatsapp' | 'contact_form' | 'calendly';
  notes: string;
  deal_value?: number;
  contact_person: string;
}

// ---- Lead Funnel ----

export type FunnelPeriod = 'day' | 'week' | 'month';

export interface LeadFunnelStages {
  leads_captured: number;
  contacted: number;
  qualified: number;
  converted: number;
}

export interface LeadFunnelResponse {
  period: FunnelPeriod;
  funnel: LeadFunnelStages;
}
