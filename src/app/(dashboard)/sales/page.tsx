import { Metadata } from 'next';
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
        <SalesDashboardStats />
      </section>

      {/* Main Dashboard Grid */}
      <div className={styles.mainGrid}>
        <div className={styles.chartCol}>
          <LeadChart />
        </div>
        <div className={styles.activityCol}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
