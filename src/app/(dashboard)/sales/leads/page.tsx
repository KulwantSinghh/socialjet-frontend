import type { Metadata } from 'next';
import styles from './page.module.css';
import { LeadsTable } from '@/components/shared/LeadsTable';

export const metadata: Metadata = {
  title: 'Leads | SocialJet CRM',
};

export default function LeadsPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Leads</h1>
        <p className={styles.subtitle}>
          All leads from every entry point — WhatsApp, webform, Calendly, and manual
        </p>
      </header>
      <LeadsTable />
    </div>
  );
}
