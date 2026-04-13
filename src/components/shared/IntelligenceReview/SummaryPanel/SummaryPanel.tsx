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
  // isFetching is true on BOTH initial load and Regenerate re-fetches
  const { data, isFetching, isError, refetch } = useMeetingSummary(meetingId);

  const summary = data?.summary;

  return (
    <section className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>AI Call Summary</h3>
        <button className={styles.regenerateBtn} onClick={() => refetch()} disabled={isFetching}>
          <RefreshIcon /> {isFetching ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {isFetching && (
        <div className={styles.loadingState}>
          <SpinnerIcon />
          <span>Generating AI summary…</span>
        </div>
      )}

      {isError && !isFetching && (
        <div className={styles.errorState}>
          Unable to generate summary. <button onClick={() => refetch()}>Try again</button>
        </div>
      )}

      {!isFetching && !isError && summary && (
        <div className={styles.summaryContent}>
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Budget</span>
              <span className={styles.metricValue}>{summary.budget || 'Not discussed'}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Timeline</span>
              <span className={styles.metricValue}>{summary.timeline || 'Not discussed'}</span>
            </div>
          </div>

          {summary.discussion_points?.length > 0 && (
            <div className={styles.discussionSection}>
              <h4 className={styles.discussionTitle}>Discussion Points</h4>
              <ul className={styles.discussionList}>
                {summary.discussion_points.map((point, i) => (
                  <li key={i} className={styles.discussionItem}>
                    <span className={styles.bullet} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isFetching && !isError && !summary && !meetingId && (
        <p className={styles.emptyState}>No meeting selected.</p>
      )}
    </section>
  );
};
