'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertToast } from '@/components/notifications/AlertToast';
import { useLeadAlerts } from '@/hooks/useLeadAlerts';
import { formatLeadSource } from '@/lib/leadAlertFormat';
import { playNotificationSound } from '@/lib/notificationSound';
import { useAlertsStore } from '@/stores/alertsStore';
import type { LeadAlert } from '@/types/leads.types';

/** True when the browser supports the Web Notifications API. */
function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Shows a native OS notification (pops outside the browser). Returns false if it could not. */
function showNativeNotification(alert: LeadAlert): boolean {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;

  const source = formatLeadSource(alert.created_by, alert.source);
  const title = alert.company ? `${alert.name} · ${alert.company}` : alert.name;
  const body = alert.message ? `${source} — ${alert.message}` : source;

  try {
    const notification = new Notification(title, {
      body,
      // Same lead never shows twice in the OS tray.
      tag: `lead-alert-${alert.lead_id}`,
      icon: '/logoPink.svg',
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}

/** In-page fallback when native notifications aren't available or are blocked. */
function showInPageToast(alert: LeadAlert): void {
  toast.custom((id) => <AlertToast alert={alert} onClose={() => toast.dismiss(id)} />, {
    id: `lead-alert-${alert.lead_id}`,
    position: 'top-center',
    duration: Infinity,
  });
}

/**
 * Watches polled lead alerts and raises a notification for every alert not yet
 * shown. Prefers a native OS notification (appears outside the browser, even on
 * another tab) and falls back to a rich in-page toast when permission is denied
 * or unsupported. Alerts are marked "popped" the moment they're shown, so they
 * never re-appear on later polls or refreshes.
 *
 * Independent of the bell's "seen" state — see alertsStore.
 */
export function useAlertNotifier() {
  // Reuses the same React Query cache as the bell (identical query key).
  const { data } = useLeadAlerts();

  // Ask for OS-notification permission once.
  useEffect(() => {
    if (notificationsSupported() && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const alerts = data?.alerts;
    if (!alerts?.length) return;

    // Read the store imperatively so this effect only depends on fetched data.
    const { poppedAlertIds, markPopped } = useAlertsStore.getState();

    const fresh = alerts.filter((a) => !poppedAlertIds.has(a.lead_id));
    if (!fresh.length) return;

    // Mark popped first so a fast re-poll can't double-show the same alert.
    markPopped(fresh.map((a) => a.lead_id));

    for (const alert of fresh) {
      const shownNatively = showNativeNotification(alert);
      if (!shownNatively) showInPageToast(alert);
    }

    // One chime per batch — guarantees audible feedback even if the OS notification is silent.
    playNotificationSound();
  }, [data]);
}
