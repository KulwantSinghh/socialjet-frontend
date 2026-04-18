import type { Metadata } from 'next';
import styles from './page.module.css';
import { InboxView } from './InboxView';

export const metadata: Metadata = {
  title: 'Inbox | SocialJet CRM',
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead } = await searchParams;
  return (
    <div className={styles.root}>
      <InboxView initialLeadId={lead} />
    </div>
  );
}
