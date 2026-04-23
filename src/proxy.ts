/**
 * Next.js Edge Proxy (equivalent to middleware in Next.js 16+).
 * Auth guard + role routing + cache headers to prevent back-button re-entry.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  '/sales': ['sales', 'admin'],
  '/campaigns': ['campaign_manager', 'campaign_manager_lead', 'admin'],
  '/finance': ['finance', 'admin'],
  '/admin': ['admin'],
  '/client': ['client', 'admin'],
};

const DEFAULT_ROUTES: Record<string, string> = {
  sales: '/sales',
  campaign_manager_lead: '/campaigns',
  campaign_manager: '/campaigns',
  finance: '/finance',
  admin: '/admin',
  client: '/client',
};

function safeDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip framework + obvious static filenames (never use pathname.includes('.') — it breaks routes like /v1.0/...).
  const lastSeg = pathname.split('/').filter(Boolean).pop() ?? '';
  const looksLikeStaticFile = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|json|map)$/i.test(
    lastSeg
  );

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || looksLikeStaticFile) {
    return NextResponse.next();
  }

  const token = request.cookies.get('socialjet_access_token')?.value;
  const roleRaw = request.cookies.get('socialjet_user_role')?.value;
  const userRole = roleRaw ? safeDecodeCookieValue(roleRaw).toLowerCase() : undefined;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // ── Not authenticated → redirect to login ─────────────────────────────────
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated → prevent going BACK to /login via browser history ──────
  // When the user visits a public page while already logged in,
  // redirect them to their dashboard instead.
  if (token && isPublicRoute) {
    const defaultRoute = userRole ? (DEFAULT_ROUTES[userRole] ?? '/login') : '/login';
    const res = NextResponse.redirect(new URL(defaultRoute, request.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  // ── Role enforcement ──────────────────────────────────────────────────────
  if (token && userRole) {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
      if (pathname.startsWith(routePrefix) && !allowedRoles.includes(userRole)) {
        const defaultRoute = DEFAULT_ROUTES[userRole] ?? '/login';
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }
  }

  // Root → login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── Pass through ─────────────────────────────────────────────────────────
  // Attach no-store Cache-Control to all protected page responses.
  // This means after logout, pressing Back forces the browser to re-check
  // with the server — and without cookies it will be redirected to /login.
  const response = NextResponse.next();
  if (!isPublicRoute && token) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
