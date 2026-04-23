import type { Metadata } from 'next';
import { CampaignApprovalsPage } from '@/components/campaigns/CampaignApprovalsPage';

export const metadata: Metadata = {
  title: 'Approvals | SocialJet CRM',
};

export default function CampaignApprovalsRoute() {
  return <CampaignApprovalsPage />;
}
