import { UserRole } from '@/types/roles.types';
import type { RoleConfig } from '@/types/roles.types';

/**
 * Central role configuration — single source of truth for
 * role → default route, label, and permissions mapping.
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [UserRole.Sales]: {
    role: UserRole.Sales,
    label: 'Sales',
    defaultRoute: '/sales',
    permissions: [
      { resource: 'leads', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'pipeline', actions: ['read', 'update'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  [UserRole.CampaignManager]: {
    role: UserRole.CampaignManager,
    label: 'Campaign Manager',
    defaultRoute: '/campaigns',
    permissions: [
      { resource: 'campaigns', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'templates', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] },
    ],
  },
  [UserRole.Finance]: {
    role: UserRole.Finance,
    label: 'Finance',
    defaultRoute: '/finance',
    permissions: [
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'billing', actions: ['read', 'update'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  [UserRole.Admin]: {
    role: UserRole.Admin,
    label: 'Admin',
    defaultRoute: '/admin',
    permissions: [{ resource: '*', actions: ['create', 'read', 'update', 'delete'] }],
  },
  [UserRole.Client]: {
    role: UserRole.Client,
    label: 'Client',
    defaultRoute: '/client',
    permissions: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
};

/**
 * Get the default redirect route for a given role.
 */
export function getDefaultRouteForRole(role: UserRole): string {
  return ROLE_CONFIGS[role]?.defaultRoute ?? '/login';
}

/**
 * Get the role config for a given role.
 */
export function getRoleConfig(role: UserRole): RoleConfig | undefined {
  return ROLE_CONFIGS[role];
}

/**
 * Check if a role has permission on a resource.
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;

  return config.permissions.some(
    (p) => (p.resource === '*' || p.resource === resource) && p.actions.includes(action)
  );
}
