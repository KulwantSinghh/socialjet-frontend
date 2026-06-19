/** Turn a raw `created_by`/`source` value (e.g. "calendly_webhook") into a friendly source label. */
export function formatLeadSource(createdBy?: string, source?: string): string {
  const raw = createdBy ?? source ?? '';
  const cleaned = raw
    .replace(/_?webhook$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!cleaned) return 'New lead';
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}
