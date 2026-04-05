/**
 * Root page — redirects to appropriate dashboard or login.
 * This redirect is also handled by middleware.ts at the edge,
 * but this serves as a fallback.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}
