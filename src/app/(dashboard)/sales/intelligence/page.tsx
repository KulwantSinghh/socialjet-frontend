import { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { IntelligenceList } from '@/components/shared/IntelligenceList';
import { IntelligenceStats } from './IntelligenceStats';

export const metadata: Metadata = {
  title: 'Sales Intelligence | SocialJet CRM',
};

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

      {/* Stats Row — dynamic, from API */}
      <IntelligenceStats />

      {/* Main Content Area (Intelligence List) */}
      <Suspense fallback={null}>
        <IntelligenceList />
      </Suspense>
    </div>
  );
}
