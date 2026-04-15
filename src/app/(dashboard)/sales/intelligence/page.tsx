import { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { IntelligenceList } from '@/components/shared/IntelligenceList';

export const metadata: Metadata = {
  title: 'Sales Intelligence | SocialJet CRM',
};

// Custom Icons for Intelligence Page
const PhoneIcon = () => (
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
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.01 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l2.21-2.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const DocIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FB923C"
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

const BlockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EF4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const HourglassIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#60A5FA"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.17c0-.53-.21-1.04-.58-1.42L12 12l-4.42 4.41c-.37.38-.58.89-.58 1.42V22" />
    <path d="M7 2v4.17c0 .53.21 1.04.58 1.42L12 12l4.42-4.41c.37-.38.58-.89.58-1.42V2" />
  </svg>
);

export default function SalesIntelligencePage() {
  return (
    <div className={styles.root}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>Sales Intelligence Agent</h1>
        <p className={styles.subtitle}>
          AI reads call transcripts, extracts key data, and generates proposals for Joel&apos;s
          review
        </p>
      </header>

      {/* Stats Row */}
      <section className={styles.statsGrid}>
        <StatsCard label="Calls Processed" value="24" trend={12.2} icon={<PhoneIcon />} />
        <StatsCard label="Proposals Generated" value="24%" trend={-31.1} icon={<DocIcon />} />
        <StatsCard label="Flagged / Blocked" value="48%" trend={12.2} icon={<BlockIcon />} />
        <StatsCard
          label="Awaiting Joel Review"
          value="67%"
          trend={-31.1}
          icon={<HourglassIcon />}
        />
      </section>

      {/* Main Content Area (Intelligence List) */}
      <Suspense fallback={null}>
        <IntelligenceList />
      </Suspense>
    </div>
  );
}
