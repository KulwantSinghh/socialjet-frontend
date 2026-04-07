import type { Metadata } from 'next';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { CampaignFunnel } from '@/components/shared/CampaignFunnel';
import { MessageDrafts } from '@/components/shared/MessageDrafts';
import { DiscoveryShortlist } from '@/components/shared/DiscoveryShortlist';

export const metadata: Metadata = {
  title: 'Campaigns Overview | SocialJet CRM',
  description: 'Manage your influencer campaigns, track outreach, and discover new creators.',
};

export default function CampaignsDashboardPage() {
  return (
    <div className={styles.root}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>Campaigns Overview</h1>
        <p className={styles.subtitle}>Your assigned campaigns and pending actions</p>
      </header>

      {/* Stats Summary Row */}
      <section className={styles.statsRow}>
        <StatsCard
          label="Active Campaigns"
          value="24"
          trend={12.2}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-brand-purple)"
              strokeWidth="2"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.5-1 1-4c2 0 3 0 4 1" />
              <path d="M15 15h3c0 2-1 3-4 1-1 0-1-1-1-4z" />
            </svg>
          }
        />
        <StatsCard
          label="Overdue Items"
          value="24"
          trend={-31.1}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" stroke="#f97316" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f97316" />
            </svg>
          }
        />
        <StatsCard
          label="Reviews Due"
          value="48"
          trend={12.2}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="m9 10 2 2 4-4" stroke="#22c55e" />
            </svg>
          }
        />
        <StatsCard
          label="Content Pending"
          value="156"
          trend={-31.1}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </section>

      {/* Main Dashboard Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Funnel & Drafts */}
        <div className={styles.leftCol}>
          <CampaignFunnel />
          <MessageDrafts />
        </div>

        {/* Right Column: AI Discovery Shortlist */}
        <div className={styles.rightCol}>
          <DiscoveryShortlist />
        </div>
      </div>
    </div>
  );
}
