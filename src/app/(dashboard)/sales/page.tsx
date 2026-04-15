import { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { LeadChart } from '@/components/shared/LeadChart';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { SalesDashboardStats } from './SalesDashboardStats';

export const metadata: Metadata = {
  title: 'Sales Overview | SocialJet CRM',
  description:
    'Manage your incoming partnerships and generate high-converting influencer proposals.',
};

export default function SalesDashboardPage() {
  return (
    <div className={styles.root}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>Sales Overview</h1>
        <p className={styles.subtitle}>
          Manage your incoming partnerships and generate high-converting influencer proposals with
          AI assistance.
        </p>
      </header>

      {/* Stats Summary Row — data from /sales/dashboard */}
      <section className={styles.statsRow}>
        <Suspense
          fallback={[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statsSkeleton} />
          ))}
        >
          <SalesDashboardStats />
        </Suspense>
      </section>

      {/* Main Dashboard Grid */}
      <div className={styles.mainGrid}>
        <div className={styles.chartCol}>
          <Suspense fallback={null}>
            <LeadChart />
          </Suspense>
        </div>
        <div className={styles.activityCol}>
          <Suspense fallback={null}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
