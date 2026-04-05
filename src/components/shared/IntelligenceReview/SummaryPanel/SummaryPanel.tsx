'use client';

import styles from './SummaryPanel.module.css';

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

export const SummaryPanel = () => {
  return (
    <section className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>AI Call Summary</h3>
        <button className={styles.regenerateBtn}>
          <RefreshIcon /> Regenerate
        </button>
      </div>

      <div className={styles.discussionSection}>
        <h4>Discussion Points</h4>
        <div className={styles.discussionBox}>
          <ul className={styles.discussionList}>
            <li>Client expressed frustration with current manual data entry costs ($60k/yr).</li>
            <li>Interested in Enterprise tier for multi-region scalability.</li>
            <li>Security compliance (SOC2) was mentioned as a prerequisite.</li>
          </ul>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Budget</span>
          <div className={styles.metricValue}>$45,000</div>
          <span className={styles.metricSub}>Initial phase cap</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Timeline</span>
          <div className={styles.metricValue}>June 1, 2024</div>
          <span className={styles.metricSub}>Go-live target</span>
        </div>
      </div>

      <div className={styles.actionItemsSection}>
        <h4>Action Items</h4>
        <div className={styles.actionList}>
          <div className={styles.actionItem}>
            <input type="checkbox" id="action-1" readOnly />
            <label htmlFor="action-1">Send SOC2 compliance documentation</label>
            <span className={styles.assigneeTag}>Joel M.</span>
          </div>
          <div className={styles.actionItem}>
            <input type="checkbox" id="action-2" readOnly />
            <label htmlFor="action-2">Draft custom proposal for Enterprise Tier</label>
            <span className={styles.assigneeTag}>Joel M.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
