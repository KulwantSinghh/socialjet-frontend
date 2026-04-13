'use client';

import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { NurtureAgents } from '@/components/shared/NurtureAgents';
import { ConversionFunnelChartClient } from '@/components/shared/ConversionFunnelChart';
import { useNurtureDashboard } from '@/hooks/useNurtureDashboard';

// ---- Inline SVG icons ----

const SequenceIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="4" rx="1" />
    <rect x="2" y="10" width="20" height="4" rx="1" />
    <rect x="2" y="17" width="20" height="4" rx="1" />
  </svg>
);

const InboxIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F97316"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const MessagesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22C55E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ReplyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 00-4-4H4" />
  </svg>
);

export function NurtureDashboardData() {
  const { data, isLoading } = useNurtureDashboard('week');

  const stats = data?.stats;

  return (
    <>
      {/* Stats Row */}
      <section className={styles.statsRow}>
        <StatsCard
          label="Active Sequences"
          value={isLoading ? '—' : String(stats?.active_sequences ?? 0)}
          icon={<SequenceIcon />}
        />
        <StatsCard
          label="Awaiting Response"
          value={isLoading ? '—' : String(stats?.awaiting_response ?? 0)}
          icon={<InboxIcon />}
        />
        <StatsCard
          label="Total Messages"
          value={isLoading ? '—' : String(stats?.total_messages ?? 0)}
          icon={<MessagesIcon />}
        />
        <StatsCard
          label="Reply Rate"
          value={isLoading ? '—' : `${stats?.reply_rate ?? 0}%`}
          icon={<ReplyIcon />}
        />
      </section>

      {/* Conversion Funnel Chart */}
      <section className={styles.chartSection}>
        <ConversionFunnelChartClient conversionFunnel={data?.conversion_funnel} />
      </section>

      {/* Nurture Agents */}
      <section className={styles.agentsSection}>
        <NurtureAgents agents={data?.nurture_agents ?? []} isLoading={isLoading} />
      </section>
    </>
  );
}
