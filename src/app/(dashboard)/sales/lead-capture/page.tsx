import { Metadata } from 'next';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
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
        <LeadAlert />
      </section>

      {/* Stats Summary Row */}
      <section className={styles.statsRow}>
        <StatsCard
          label="Total Leads"
          value="24"
          trend={12.2}
          icon={<span style={{ fontSize: '1.2rem' }}>👤+</span>}
        />
        <StatsCard
          label="Web Form"
          value="24"
          trend={-31.1}
          icon={<span style={{ fontSize: '1.2rem' }}>🌐</span>}
        />
        <StatsCard
          label="Outreach Whatsapp"
          value="48"
          trend={12.2}
          icon={<span style={{ fontSize: '1.2rem', color: '#25D366' }}>💬</span>}
        />
        <StatsCard
          label="Converted"
          value="156"
          trend={-31.1}
          icon={<span style={{ fontSize: '1.2rem' }}>🎯</span>}
        />
      </section>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.sourceCol}>
          <SourceChart />
        </div>
        <div className={styles.funnelCol}>
          <FunnelChart />
        </div>
      </div>

      {/* Main Leads Table */}
      <section className={styles.tableSection}>
        <LeadsTable />
      </section>
    </div>
  );
}
