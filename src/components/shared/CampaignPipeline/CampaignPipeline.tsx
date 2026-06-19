import styles from './CampaignPipeline.module.css';
import { cn } from '@/lib/utils';
import type { CampaignPipelinePhase } from '@/types/dashboard.types';

interface CampaignPipelineProps {
  phases: CampaignPipelinePhase[];
  lastUpdatedLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

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

export const CampaignPipeline = ({
  phases,
  lastUpdatedLabel,
  onRefresh,
  isRefreshing,
}: CampaignPipelineProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Campaign Pipeline</h3>
        <div className={styles.meta}>
          {lastUpdatedLabel && <span className={styles.lastUpdated}>{lastUpdatedLabel}</span>}
          {onRefresh && (
            <button
              type="button"
              className={cn(styles.refreshBtn, isRefreshing && styles.refreshing)}
              onClick={onRefresh}
              aria-label="Refresh pipeline"
            >
              <RefreshIcon />
            </button>
          )}
        </div>
      </div>

      <div className={styles.pipeline}>
        {phases.map((stage, index) => (
          <div key={stage.phase} className={styles.stageGroup}>
            <div className={cn(styles.stage, stage.count === 0 && styles.stageEmpty)}>
              <span className={styles.stageLabel}>{stage.label}</span>
              <div className={styles.stageTrack}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className={styles.trackDot} />
                ))}
              </div>
              <span className={styles.stageCount}>{String(stage.count).padStart(2, '0')}</span>
            </div>
            {index < phases.length - 1 && (
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
