import { Metadata } from 'next';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { NurtureAgents } from '@/components/shared/NurtureAgents';
import { ConversionFunnelChartClient } from '@/components/shared/ConversionFunnelChart';

export const metadata: Metadata = {
  title: 'Nurture | SocialJet CRM',
  description:
    'Manage your incoming partnerships and generate high-converting influencer proposals with AI assistance.',
};

// ---- Inline SVG icons (no external deps, zero bundle overhead) ----

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

const ClickRateIcon = () => (
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
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
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
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export default function NurturePage() {
  return (
    <div className={styles.root}>
      {/* Page Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Nurture Details</h1>
        <p className={styles.subtitle}>
          Manage your incoming partnerships and generate high-converting influencer proposals with
          AI assistance.
        </p>
      </header>

      {/* Stats Row */}
      <section className={styles.statsRow}>
        <StatsCard label="Active Sequences" value="24" trend={12.2} icon={<SequenceIcon />} />
        <StatsCard label="Awaiting Response" value="24%" trend={-31} icon={<InboxIcon />} />
        <StatsCard label="Avg Click Rate" value="48%" trend={12.2} icon={<ClickRateIcon />} />
        <StatsCard label="Avg Reply Rate" value="67%" trend={-31} icon={<ReplyIcon />} />
      </section>

      {/* Conversion Funnel Chart */}
      <section className={styles.chartSection}>
        <ConversionFunnelChartClient />
      </section>

      {/* Nurture Agents */}
      <section className={styles.agentsSection}>
        <NurtureAgents />
      </section>
    </div>
  );
}
