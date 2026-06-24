import type { Metadata } from 'next';
import { CampaignMeetingsView } from './CampaignMeetingsView';

export const metadata: Metadata = {
  title: 'Meetings | SocialJet CRM',
};

export default function CampaignMeetingsRoute() {
  return <CampaignMeetingsView />;
}
