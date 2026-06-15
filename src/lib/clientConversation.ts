/**
 * Presentation helpers for client conversation UI.
 */

import type { ClientMessageType } from '@/types/clientConversation.types';
import type { Tone } from '@/lib/outreach';
import { messageStatusMeta } from '@/lib/outreach';

const CLIENT_MESSAGE_TYPE_LABELS: Record<string, string> = {
  client_email: 'Client Email',
  client_reply: 'Client Reply',
};

export function clientMessageTypeLabel(type: ClientMessageType): string {
  return CLIENT_MESSAGE_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function clientMessageStatusMeta(status: string): { label: string; tone: Tone } {
  return messageStatusMeta(status);
}

export function clientMessageKey(
  msg: { message_id?: string; created_at: string },
  index: number
): string {
  return msg.message_id ?? `${msg.created_at}-${index}`;
}
