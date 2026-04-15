import { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { LeadCaptureStats } from './LeadCaptureStats';
import { LeadAlert } from '@/components/shared/LeadAlert';
import { SourceChart } from '@/components/shared/SourceChart';
import { FunnelChart } from '@/components/shared/FunnelChart';
import { LeadsTable } from '@/components/shared/LeadsTable';

export const metadata: Metadata = {
  title: 'Leads Pipeline | SocialJet CRM',
  description: 'Manage your incoming partnerships and lead sources in one place.',
};

export default function LeadCapturePage() {
  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Leads Pipeline</h1>
        <p className={styles.subtitle}>
          Manage your incoming partnerships and generate high-converting influencer proposals with
          AI assistance.
        </p>
      </header>

      {/* Top Banner Alert */}
      <section className={styles.alertSection}>
        <Suspense fallback={null}>
          <LeadAlert />
        </Suspense>
      </section>

      {/* Stats Summary Row */}
      <section className={styles.statsRow}>
        <Suspense fallback={null}>
          <LeadCaptureStats />
        </Suspense>
      </section>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.sourceCol}>
          <Suspense fallback={null}>
            <SourceChart />
          </Suspense>
        </div>
        <div className={styles.funnelCol}>
          <Suspense fallback={null}>
            <FunnelChart />
          </Suspense>
        </div>
      </div>

      {/* Main Leads Table */}
      <section className={styles.tableSection}>
        <Suspense fallback={null}>
          <LeadsTable />
        </Suspense>
      </section>
    </div>
  );
}
