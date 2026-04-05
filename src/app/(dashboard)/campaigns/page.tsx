import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Campaigns Dashboard' };

export default function CampaignsDashboardPage() {
  return (
    <div>
      <h1>Campaigns Dashboard</h1>
      <p>Campaign overview, active campaigns, and metrics will be displayed here.</p>
    </div>
  );
}
