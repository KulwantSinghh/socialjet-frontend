'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';

/**
 * Higher-Order Component that guards routes requiring authentication.
 * Redirects to /login if the user is not authenticated.
 *
 * @example
 * export default withAuth(DashboardPage);
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  function AuthGuard(props: P) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  }

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthGuard;
}
