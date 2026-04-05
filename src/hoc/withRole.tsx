'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/roles.types';
import { getDefaultRouteForRole } from '@/lib/roleConfig';

/**
 * Higher-Order Component that guards routes based on user role.
 * Redirects to the user's default dashboard if their role doesn't match.
 *
 * @example
 * export default withRole(SalesPage, [UserRole.Sales, UserRole.Admin]);
 */
export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: UserRole[]
) {
  function RoleGuard(props: P) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
      if (user && !allowedRoles.includes(user.role as UserRole)) {
        const defaultRoute = getDefaultRouteForRole(user.role as UserRole);
        router.replace(defaultRoute);
      }
    }, [user, router]);

    if (!user || !allowedRoles.includes(user.role as UserRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  RoleGuard.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return RoleGuard;
}
