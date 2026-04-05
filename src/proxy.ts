import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication.
 */
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

/**
 * Routes that start with these prefixes require specific roles.
 * This is enforced at the edge level before the page loads.
 */
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  '/sales': ['sales', 'admin'],
  '/campaigns': ['campaign_manager', 'admin'],
  '/finance': ['finance', 'admin'],
  '/admin': ['admin'],
  '/client': ['client', 'admin'],
};

/**
 * Default dashboard routes per role.
 */
const DEFAULT_ROUTES: Record<string, string> = {
  sales: '/sales',
  campaign_manager: '/campaigns',
  finance: '/finance',
  admin: '/admin',
  client: '/client',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get token from cookies (middleware can't access localStorage)
  const token = request.cookies.get('socialjet_access_token')?.value;
  const userRole = request.cookies.get('socialjet_user_role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Not authenticated → redirect to login (unless already on public route)
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated + on login page → redirect to dashboard
  if (token && isPublicRoute) {
    const defaultRoute = DEFAULT_ROUTES[userRole ?? ''] ?? '/sales';
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // Authenticated → check role access
  if (token && userRole) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
      if (pathname.startsWith(routePrefix) && !allowedRoles.includes(userRole)) {
        // User doesn't have access → redirect to their dashboard
        const defaultRoute = DEFAULT_ROUTES[userRole] ?? '/login';
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }
  }

  // Root path → redirect to role dashboard or login
  if (pathname === '/') {
    if (token && userRole) {
      const defaultRoute = DEFAULT_ROUTES[userRole] ?? '/sales';
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
