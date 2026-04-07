import type { Metadata } from 'next';
import styles from './page.module.css';
import { OnboardingTable } from '@/components/shared/OnboardingTable';

export const metadata: Metadata = {
  title: 'Onboarding Agent | SocialJet CRM',
  description: 'Manage lead onboarding across multiple campaign stages.',
};

export default function OnboardingPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Onboarding Agent</h1>
        <p className={styles.subtitle}>Select a campaign to view onboarding details</p>
      </header>
      <main className={styles.main}>
        <OnboardingTable />
      </main>
    </div>
  );
}
