import type { Metadata } from 'next';
import { CampaignInboxPage } from '@/components/campaigns/CampaignInboxPage';

export const metadata: Metadata = {
  title: 'Inbox | SocialJet CRM',
};

export default async function CampaignInboxRoute({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; creator?: string; tab?: string }>;
}) {
  const { lead, creator, tab } = await searchParams;
  return <CampaignInboxPage initialLeadId={lead} initialCreatorId={creator} initialTab={tab} />;
}
