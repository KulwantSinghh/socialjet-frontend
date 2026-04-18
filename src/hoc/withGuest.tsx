'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultRouteForRole } from '@/lib/roleConfig';
import { UserRole } from '@/types/roles.types';

/**
 * Higher-Order Component that prevents authenticated users from accessing a route.
 * Redirects them to their default dashboard if they are already logged in.
 */
export function withGuest<P extends object>(WrappedComponent: ComponentType<P>) {
  function GuestGuard(props: P) {
    const router = useRouter();
    const { isAuthenticated, role } = useAuthStore();

    useEffect(() => {
      if (isAuthenticated && role) {
        const defaultRoute = getDefaultRouteForRole(role as UserRole);
        router.replace(defaultRoute);
      }
    }, [isAuthenticated, role, router]);

    if (isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  GuestGuard.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return GuestGuard;
}
