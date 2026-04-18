import type { Metadata } from 'next';
import styles from './page.module.css';
import { LeadDetailView } from './LeadDetailView';

export const metadata: Metadata = {
  title: 'Lead Detail | SocialJet CRM',
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className={styles.root}>
      <LeadDetailView leadId={id} />
    </div>
  );
}
