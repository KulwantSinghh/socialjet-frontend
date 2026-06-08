/**
 * Presentation helpers for the influencer outreach UI.
 * Pure functions only — labels, tones, and formatting.
 */

import type {
  NegotiationStatus,
  OutreachMessageStatus,
  OutreachMessageType,
} from '@/types/outreach.types';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

export function getInitials(name: string): string {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** "2m", "3h", "Jun 6" depending on age. Safe for null/invalid input. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMoney(amount: number | null | undefined, currency = 'SGD'): string {
  if (amount == null) return '—';
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  initial_outreach: 'Initial Outreach',
  follow_up_1: 'Follow-up · Day 1',
  follow_up_2: 'Follow-up · Day 3',
  negotiation: 'Negotiation',
  brief: 'KOL Brief',
  custom: 'Custom Message',
};

export function messageTypeLabel(type: OutreachMessageType | string): string {
  return MESSAGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

const MESSAGE_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'warning' },
  approved: { label: 'Sending…', tone: 'info' },
  edited: { label: 'Sending…', tone: 'info' },
  sent: { label: 'Sent', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function messageStatusMeta(status: OutreachMessageStatus | string): {
  label: string;
  tone: Tone;
} {
  return MESSAGE_STATUS_META[status] ?? { label: status, tone: 'neutral' };
}

const NEGOTIATION_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'neutral' },
  interested: { label: 'Interested', tone: 'info' },
  negotiating: { label: 'Negotiating', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
  on_hold: { label: 'On Hold', tone: 'neutral' },
  no_response: { label: 'No Response', tone: 'neutral' },
};

export function negotiationStatusMeta(status: NegotiationStatus | string): {
  label: string;
  tone: Tone;
} {
  return NEGOTIATION_STATUS_META[status] ?? { label: status, tone: 'neutral' };
}

export const NEGOTIATION_STATUS_OPTIONS: NegotiationStatus[] = [
  'interested',
  'negotiating',
  'declined',
  'confirmed',
  'on_hold',
  'no_response',
];
