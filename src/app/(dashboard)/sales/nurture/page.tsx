import { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { NurtureDashboardData } from './NurtureDashboardData';

export const metadata: Metadata = {
  title: 'Nurture | SocialJet CRM',
  description:
    'Manage your incoming partnerships and generate high-converting influencer proposals with AI assistance.',
};

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

      {/* Stats + Funnel Chart + Nurture Agents — all from /nurture/dashboard */}
      <Suspense fallback={null}>
        <NurtureDashboardData />
      </Suspense>
    </div>
  );
}
