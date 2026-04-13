import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Client Portal | SocialJet CRM' };

export default function ClientDashboardPage() {
  return (
    <div>
      <h1>Client Portal</h1>
      <p>Client-facing dashboard will be displayed here.</p>
    </div>
  );
}
