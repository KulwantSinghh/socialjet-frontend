import type { Lead } from '@/types/leads.types';

/**
 * Normalized view of the message a lead sent us, extracted from the various
 * `notes` / `message` shapes the API returns depending on the lead source.
 *
 * - Webform leads carry a clean top-level `message` field (and a duplicate
 *   inside `notes` after "Message:").
 * - Calendly leads embed the message inside `notes` after
 *   "Please share details to help prepare for our meeting::", optionally
 *   prefixed with a booking title / scheduled date and suffixed with
 *   "| Meeting canceled".
 * - WhatsApp leads embed it after "WhatsApp:".
 */
export interface ParsedLeadMessage {
  /** The human-written message, cleaned of metadata. Null if none found. */
  message: string | null;
  /** Calendly booking title, when present. */
  bookingTitle?: string;
  /** Raw scheduled-at value from the Calendly note, when present. */
  scheduledAt?: string;
  /** True when the underlying meeting was canceled. */
  canceled: boolean;
}

type LeadMessageInput = Pick<Lead, 'message' | 'notes'>;

function clean(value: string): string {
  return value.replace(/\s*\|\s*Meeting canceled\s*$/i, '').trim();
}

/**
 * Parse the lead's inbound message into a normalized, source-agnostic shape.
 * Both the pipeline board and the lead detail view consume this so the message
 * is surfaced consistently regardless of where the lead came from.
 */
export function parseLeadMessage(lead: LeadMessageInput): ParsedLeadMessage {
  const notes = typeof lead.notes === 'string' ? lead.notes : '';
  const canceled = /\bMeeting canceled\b/i.test(notes);

  // 1. Clean top-level message (webform leads expose this directly).
  if (typeof lead.message === 'string' && lead.message.trim()) {
    return { message: lead.message.trim(), canceled };
  }

  if (notes) {
    const titleMatch = notes.match(
      /Calendly booking:\s*(.*?)(?:\s*\|\s*Scheduled:|\s*\|\s*Please share|\s*\|\s*Meeting canceled|$)/i
    );
    const scheduledMatch = notes.match(/Scheduled:\s*([^|]+)/i);
    const bookingTitle = titleMatch?.[1]?.trim() || undefined;
    const scheduledAt = scheduledMatch?.[1]?.trim() || undefined;

    // 2. Calendly — message after the "prepare for our meeting" prompt.
    const prepMatch = notes.match(
      /Please share details to help prepare for our meeting::\s*([\s\S]*)/i
    );
    if (prepMatch) {
      return {
        message: clean(prepMatch[1]) || null,
        bookingTitle,
        scheduledAt,
        canceled,
      };
    }

    // 3. Webform — "... | Message: <msg> | Submitted: <date>".
    const formMatch = notes.match(/Message:\s*([\s\S]*?)(?:\s*\|\s*Submitted:|$)/i);
    if (formMatch) {
      return { message: clean(formMatch[1]) || null, canceled };
    }

    // 4. WhatsApp — "WhatsApp: <msg> | WA (date): <msg>".
    const waMatch = notes.match(/WhatsApp:\s*([\s\S]*?)(?:\s*\|\s*WA\s*\(|$)/i);
    if (waMatch) {
      return { message: clean(waMatch[1]) || null, canceled };
    }
  }

  return { message: null, canceled };
}

/** Single-line preview of the lead message, truncated for compact UI (cards). */
export function leadMessagePreview(lead: LeadMessageInput, maxLength = 90): string | null {
  const { message } = parseLeadMessage(lead);
  if (!message) return null;
  const oneLine = message.replace(/\s+/g, ' ').trim();
  return oneLine.length > maxLength ? `${oneLine.slice(0, maxLength).trimEnd()}…` : oneLine;
}
