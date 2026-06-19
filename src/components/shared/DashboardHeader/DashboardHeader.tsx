'use client';

import styles from './DashboardHeader.module.css';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  name: string;
  /** ISO timestamp from the dashboard payload's `generated_at`. */
  generatedAt?: string;
  isFetching?: boolean;
  onRefresh?: () => void;
  /** Right-aligned actions (e.g. Add Member). */
  actions?: React.ReactNode;
}

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 4v6h6M23 20v-6h-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const relativeTime = (iso?: string): string => {
  if (!iso) return 'Live';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Live';
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 45) return 'Updated just now';
  if (diffSec < 90) return 'Updated 1 min ago';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `Updated ${diffMin} mins ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `Updated ${diffHr} hr ago`;
  return `Updated ${Math.round(diffHr / 24)} days ago`;
};

export const DashboardHeader = ({
  name,
  generatedAt,
  isFetching,
  onRefresh,
  actions,
}: DashboardHeaderProps) => {
  return (
    <header className={styles.root}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>
          Welcome back, {name} <span className={styles.wave}>👋</span>
        </h1>
        <p className={styles.subtitle}>Here&#39;s what&#39;s happening in your workspace today.</p>
      </div>

      <div className={styles.right}>
        <div className={styles.livePill}>
          <span className={cn(styles.liveDot, isFetching && styles.liveDotActive)} />
          <span className={styles.liveLabel}>{relativeTime(generatedAt)}</span>
          {onRefresh && (
            <button
              type="button"
              className={cn(styles.refreshBtn, isFetching && styles.spinning)}
              onClick={onRefresh}
              aria-label="Refresh dashboard"
              disabled={isFetching}
            >
              <RefreshIcon />
            </button>
          )}
        </div>
        {actions}
      </div>
    </header>
  );
};
