export enum UserRole {
  Sales = 'sales',
  CampaignManagerLead = 'campaign_manager_lead',
  CampaignManager = 'campaign_manager',
  Finance = 'finance',
  Admin = 'admin',
  Client = 'client',
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  defaultRoute: string;
  permissions: Permission[];
}
