import type { Metadata } from 'next';
import { CampaignHealthChartClient, RevenueROIChartClient } from './charts.client';

import styles from './page.module.css';
import { AdminStatsCard } from '@/components/shared/AdminStatsCard';
import { CampaignPipeline } from '@/components/shared/CampaignPipeline';
import { AIActivityFeed } from '@/components/shared/AIActivityFeed';
import { MyTasksPanel } from '@/components/shared/MyTasksPanel';
import { AdminActions } from './AdminActions';

// ---- Icon Components (inline, server-safe) ----
const CampaignIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.54 8.46C16.4771 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4771 14.6024 15.54 15.54"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#f97316" strokeWidth="1.5" />
    <path d="M12 7V12L15 15" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 17H6.2C5.0799 17 4.51984 17 4.09202 16.782C3.71569 16.5903 3.40973 16.2843 3.21799 15.908C3 15.4802 3 14.9201 3 13.8V7.2C3 6.0799 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V13.8C21 14.9201 21 15.4802 20.782 15.908C20.5903 16.2843 20.2843 16.5903 19.908 16.782C19.4802 17 18.9201 17 17.8 17H15"
      stroke="#22c55e"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 14L9 17L12 20"
      stroke="#22c55e"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AIMatchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
      stroke="#6c63ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="4" y1="22" x2="4" y2="15" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div>
          <h1 className={styles.welcomeTitle}>Welcome back, Julie 👋</h1>
          <p className={styles.welcomeSubtitle}>
            Here&#39;s what&#39;s happening in your workspace today.
          </p>
        </div>
        <AdminActions />
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <AdminStatsCard label="Active Campaigns" value={24} trend={12.2} icon={<CampaignIcon />} />
        <AdminStatsCard label="Pending Approvals" value={24} trend={-31.1} icon={<ClockIcon />} />
        <AdminStatsCard label="Outreach Replies" value={48} trend={12.2} icon={<ReplyIcon />} />
        <AdminStatsCard
          label="AI Influencer Matches"
          value={156}
          trend={-31.1}
          icon={<AIMatchIcon />}
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        <div className={styles.healthChartWrapper}>
          <CampaignHealthChartClient />
        </div>
        <div className={styles.revenueChartWrapper}>
          <RevenueROIChartClient />
        </div>
      </div>

      {/* Tasks + AI Feed Row */}
      <div className={styles.tasksRow}>
        <div className={styles.tasksWrapper}>
          <MyTasksPanel />
        </div>
        <div className={styles.feedWrapper}>
          <AIActivityFeed />
        </div>
      </div>

      {/* Campaign Pipeline */}
      <div className={styles.pipelineRow}>
        <CampaignPipeline />
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2026 SocialJet. All rights reserved.</span>
      </footer>
    </div>
  );
}
