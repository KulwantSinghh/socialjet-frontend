'use client';

import { useAlertNotifier } from '@/hooks/useAlertNotifier';

/**
 * Headless component: drives the global lead-alert toast system.
 * Mount once inside the dashboard shell. Renders nothing.
 */
export function AlertNotifier() {
  useAlertNotifier();
  return null;
}
