'use client';

import styles from './SummaryPanel.module.css';
import { useMeetingSummary } from '@/hooks/useIntelligenceCalls';

const RefreshIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6" />
    <path d="M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.spinner}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

interface SummaryPanelProps {
  meetingId?: string;
}

export const SummaryPanel = ({ meetingId }: SummaryPanelProps) => {
  const { data: summary, isLoading, isError, refetch } = useMeetingSummary(meetingId);

  return (
    <section className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>AI Call Summary</h3>
        <button className={styles.regenerateBtn} onClick={() => refetch()} disabled={isLoading}>
          <RefreshIcon /> {isLoading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <SpinnerIcon />
          <span>Generating AI summary…</span>
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.errorState}>
          Unable to generate summary. <button onClick={() => refetch()}>Try again</button>
        </div>
      )}

      {!isLoading && !isError && summary && (
        <div className={styles.summaryContent}>
          {summary.summary?.discussion_points?.map((point, i) => (
            <p key={i} className={styles.summaryText}>
              {point}
            </p>
          ))}
          {summary.summary?.budget && (
            <p className={styles.summaryText}>
              <strong>Budget:</strong> {summary.summary.budget}
            </p>
          )}
          {summary.summary?.timeline && (
            <p className={styles.summaryText}>
              <strong>Timeline:</strong> {summary.summary.timeline}
            </p>
          )}
        </div>
      )}

      {!isLoading && !isError && !summary && !meetingId && (
        <p className={styles.emptyState}>No meeting selected.</p>
      )}
    </section>
  );
};
