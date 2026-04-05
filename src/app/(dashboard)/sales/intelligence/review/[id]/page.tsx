import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import { AlertBanner, TranscriptPanel, SummaryPanel, ProposalPreview } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Leads Intelligence Review | SocialJet CRM',
};

export default async function IntelligenceReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: _id } = await params;

  return (
    <div className={styles.root}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Leads Intelligence</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/sales/intelligence">Back</Link> / <span>Nykaa Beauty</span>
        </div>
      </div>

      {/* Logic Alert Panel */}
      <AlertBanner message="This call appears to be a negative outcome. Review before proceeding with a proposal." />

      {/* Analysis Grid */}
      <div className={styles.analysisGrid}>
        <TranscriptPanel />
        <SummaryPanel />
      </div>

      {/* Document Preview Section */}
      <ProposalPreview />
    </div>
  );
}
