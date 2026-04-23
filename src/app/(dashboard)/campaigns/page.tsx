import type { Metadata } from 'next';
import { CampaignDashboard } from '@/components/campaigns/CampaignDashboard';

export const metadata: Metadata = {
  title: 'Campaigns | SocialJet CRM',
};

export default function CampaignsDashboardPage() {
  return <CampaignDashboard />;
}
