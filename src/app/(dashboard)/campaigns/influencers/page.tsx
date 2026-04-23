import type { Metadata } from 'next';
import { CampaignInfluencersPage } from '@/components/campaigns/CampaignInfluencersPage';

export const metadata: Metadata = {
  title: 'Influencers | SocialJet CRM',
};

export default function InfluencersPage() {
  return <CampaignInfluencersPage />;
}
