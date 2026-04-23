import type { Metadata } from 'next';
import { CampaignInboxPage } from '@/components/campaigns/CampaignInboxPage';

export const metadata: Metadata = {
  title: 'Inbox | SocialJet CRM',
};

export default function CampaignInboxRoute() {
  return <CampaignInboxPage />;
}
