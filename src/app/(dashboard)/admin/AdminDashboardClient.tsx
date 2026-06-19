'use client';

import styles from './page.module.css';
import { CampaignHealthChartClient, RevenueROIChartClient } from './charts.client';
import { AdminActions } from './AdminActions';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuthStore } from '@/stores/authStore';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { AdminStatsCard } from '@/components/shared/AdminStatsCard';
import { LeadPipelineFunnel } from '@/components/shared/LeadPipelineFunnel';
import { CampaignPipeline } from '@/components/shared/CampaignPipeline';
import { InsightsGrid } from '@/components/shared/InsightsGrid';

// ---- Stat card icons (inline, client-safe) ----
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
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
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
      d="M12 3l1.9 4.7L18 9l-4.1 1.3L12 15l-1.9-4.7L6 9l4.1-1.3z"
      stroke="#6c63ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 14l.8 2 .9-2 .9 2 .8-2" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SkeletonBlock = ({ height }: { height: number }) => (
  <div className={styles.skeleton} style={{ height }} />
);

const LoadingState = () => (
  <div className={styles.page}>
    <SkeletonBlock height={64} />
    <div className={styles.statsRow}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} height={132} />
      ))}
    </div>
    <div className={styles.chartsRow}>
      <SkeletonBlock height={320} />
      <SkeletonBlock height={320} />
    </div>
    <SkeletonBlock height={220} />
    <div className={styles.insightsSkeleton}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBlock key={i} height={180} />
      ))}
    </div>
  </div>
);

const formatNumber = (value: number) => value.toLocaleString('en-US');

export const AdminDashboardClient = () => {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useAdminDashboard();
  const user = useAuthStore((s) => s.user);
  const username = useAuthStore((s) => s.username);

  const displayName = user?.firstName?.trim() || username?.trim() || 'there';

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (isError && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Couldn&#39;t load the dashboard</h2>
          <p className={styles.errorText}>Something went wrong fetching your workspace insights.</p>
          <button className={styles.retryBtn} onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, campaign_health, revenue_trend, lead_pipeline, campaign_pipeline } = data;
  const { approvals_breakdown, insights, generated_at } = data;

  return (
    <div className={styles.page}>
      <DashboardHeader
        name={displayName}
        generatedAt={generated_at}
        isFetching={isFetching}
        onRefresh={() => refetch()}
        actions={<AdminActions />}
      />

      {/* Overview */}
      <section className={styles.section}>
        <div className={styles.statsRow}>
          <AdminStatsCard
            label="Active Campaigns"
            value={formatNumber(stats.active_campaigns.value)}
            trend={stats.active_campaigns.trend}
            icon={<CampaignIcon />}
          />
          <AdminStatsCard
            label="Pending Approvals"
            value={formatNumber(stats.pending_approvals.value)}
            trend={stats.pending_approvals.trend}
            icon={<ClockIcon />}
            breakdown={[
              { label: 'proposals', value: approvals_breakdown.proposals },
              { label: 'content', value: approvals_breakdown.content },
              { label: 'email drafts', value: approvals_breakdown.email_drafts },
              { label: 'onboarding', value: approvals_breakdown.onboarding_docs },
              { label: 'outreach', value: approvals_breakdown.outreach_drafts },
            ]}
          />
          <AdminStatsCard
            label="Outreach Replies"
            value={formatNumber(stats.outreach_replies.value)}
            trend={stats.outreach_replies.trend}
            icon={<ReplyIcon />}
          />
          <AdminStatsCard
            label="AI Influencer Matches"
            value={formatNumber(stats.ai_influencer_matches.value)}
            trend={stats.ai_influencer_matches.trend}
            icon={<AIMatchIcon />}
          />
        </div>
      </section>

      {/* Performance */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>Performance</span>
        <div className={styles.chartsRow}>
          <div className={styles.healthChartWrapper}>
            <CampaignHealthChartClient
              segments={campaign_health.segments}
              onTrackPct={campaign_health.on_track_pct}
              total={campaign_health.total}
            />
          </div>
          <div className={styles.revenueChartWrapper}>
            <RevenueROIChartClient data={revenue_trend} />
          </div>
        </div>
      </section>

      {/* Pipelines */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>Pipelines</span>
        <div className={styles.pipelinesStack}>
          <LeadPipelineFunnel stages={lead_pipeline} />
          <CampaignPipeline
            phases={campaign_pipeline}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            lastUpdatedLabel={
              dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : undefined
            }
          />
        </div>
      </section>

      {/* Insights */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>Insights</span>
        <InsightsGrid insights={insights} />
      </section>

      <footer className={styles.footer}>
        <span>© 2026 SocialJet. All rights reserved.</span>
      </footer>
    </div>
  );
};
