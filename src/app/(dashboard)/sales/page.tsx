import { Metadata } from 'next';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { LeadChart } from '@/components/shared/LeadChart';
import { ActivityFeed } from '@/components/shared/ActivityFeed';
import { AlertCard } from '@/components/shared/AlertCard';

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

      {/* Stats Summary Row */}
      <section className={styles.statsRow}>
        <StatsCard
          label="New Leads"
          value="24"
          trend={12.2}
          icon={<span style={{ fontSize: '1.2rem' }}>👤+</span>}
        />
        <StatsCard
          label="Web Form"
          value="24"
          trend={-31.1}
          icon={<span style={{ fontSize: '1.2rem' }}>🔄</span>}
        />
        <StatsCard
          label="Calls Done"
          value="48"
          trend={12.2}
          icon={<span style={{ fontSize: '1.2rem' }}>📞</span>}
        />
        <StatsCard
          label="Conv. Rate"
          value="156"
          trend={-31.1}
          icon={<span style={{ fontSize: '1.2rem' }}>📈</span>}
        />
      </section>

      {/* Main Dashboard Grid */}
      <div className={styles.mainGrid}>
        {/* Main Column */}
        <div className={styles.chartCol}>
          <LeadChart />
          <div style={{ marginTop: 'var(--space-6)' }}>
            <AlertCard />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className={styles.activityCol}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
