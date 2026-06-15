import type { ContentItem, SendScheduleEmailsPayload } from '@/types/campaign.types';

/** Content eligible for schedule notification emails. */
export function isScheduleEmailEligible(item: ContentItem): boolean {
  return item.status === 'client_approved' && Boolean(item.scheduledAt);
}

export function filterScheduleEligibleLinks(links: ContentItem[]): ContentItem[] {
  return links.filter(isScheduleEmailEligible);
}

export function formatScheduleDate(value: string): string {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function buildSendScheduleEmailsPayload(
  leadId: string,
  brandName: string,
  links: ContentItem[]
): SendScheduleEmailsPayload {
  const eligible = filterScheduleEligibleLinks(links);

  const byCreator = new Map<
    string,
    { name: string; items: { content_id: string; scheduled_at: string }[] }
  >();

  for (const item of eligible) {
    const creatorId = item.influencerId;
    if (!creatorId || !item.scheduledAt) continue;

    const existing = byCreator.get(creatorId);
    const video = { content_id: item.id, scheduled_at: item.scheduledAt };

    if (existing) {
      existing.items.push(video);
    } else {
      byCreator.set(creatorId, {
        name: item.influencerName || 'Creator',
        items: [video],
      });
    }
  }

  const creators = [...byCreator.entries()]
    .map(([creator_id, { name, items }]) => ({
      creator_id,
      creator_name: name,
      status: 'finalized' as const,
      videos: items.length,
      items,
    }))
    .sort((a, b) => a.creator_name.localeCompare(b.creator_name));

  return {
    lead_id: leadId,
    brand_name: brandName,
    scheduling_finalized: true,
    emails_sent: creators.length,
    videos_included: eligible.length,
    creators,
  };
}
