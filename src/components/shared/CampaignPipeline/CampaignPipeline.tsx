import styles from './CampaignPipeline.module.css';

interface PipelineStage {
  label: string;
  count: number;
}

const STAGES: PipelineStage[] = [
  { label: 'Leads', count: 42 },
  { label: 'Setup', count: 9 },
  { label: 'Proposal', count: 9 },
  { label: 'Discovery', count: 9 },
  { label: 'Outreach', count: 9 },
  { label: 'Review', count: 9 },
  { label: 'Live', count: 9 },
  { label: 'Analytics', count: 9 },
];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18l6-6-6-6"
      stroke="#d1d5db"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 4v6h6M23 20v-6h-6"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CampaignPipeline = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Campaign Pipeline</h3>
        <div className={styles.meta}>
          <span className={styles.lastUpdated}>Last updated 4m ago</span>
          <RefreshIcon />
        </div>
      </div>

      <div className={styles.pipeline}>
        {STAGES.map((stage, index) => (
          <div key={stage.label} className={styles.stageGroup}>
            <div className={styles.stage}>
              <span className={styles.stageLabel}>{stage.label}</span>
              <div className={styles.stageTrack}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className={styles.trackDot} />
                ))}
              </div>
              <span className={styles.stageCount}>{String(stage.count).padStart(2, '0')}</span>
            </div>
            {index < STAGES.length - 1 && (
              <div className={styles.arrow}>
                <ArrowIcon />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
