import type { Metadata } from 'next';
import { CampaignLeadsList } from '@/components/campaigns/CampaignLeadsList';

export const metadata: Metadata = {
  title: 'Campaign Leads | SocialJet CRM',
};

export default function CampaignLeadsPage() {
  return <CampaignLeadsList />;
}
