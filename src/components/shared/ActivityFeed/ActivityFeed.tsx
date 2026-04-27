'use client';

import styles from './ActivityFeed.module.css';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { formatRelativeTime, truncate } from '@/lib/utils';
import type { SalesActivity } from '@/types/sales.types';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Parse "Zoom transcript ready: <Title> | Meeting: … | Duration: N min" */
function parseMeetingDescription(description: string): {
  title: string;
  duration: string | null;
} {
  const titleMatch = description.match(/^Zoom transcript ready:\s+(.+?)\s+\|/i);
  const durationMatch = description.match(/Duration:\s+(\d+\s+\w+)/i);
  return {
    title: titleMatch?.[1] ?? description,
    duration: durationMatch?.[1] ?? null,
  };
}

interface ActivityConfig {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

function getActivityConfig(type: string): ActivityConfig {
  switch (type) {
    case 'zoom_transcript_ready':
      return {
        label: 'Zoom Call',
        color: '#2D8CFF',
        bg: 'rgba(45,140,255,0.10)',
        icon: <VideoIcon />,
      };
    default:
      return {
        label: type.replace(/_/g, ' '),
        color: '#6C63FF',
        bg: 'rgba(108,99,255,0.10)',
        icon: <ActivityIcon />,
      };
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export const ActivityFeed = () => {
  const { activities, isLoading, isFetching, hasMore, loadMore } = useActivityFeed();

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Activity Feed</h3>
        {isFetching && !isLoading && <span className={styles.refreshDot} title="Refreshing…" />}
      </div>

      {/* Scrollable list — grows to fill remaining space, never pushes card taller */}
      <div className={styles.list}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonItem}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} style={{ width: '72%' }} />
                  <div className={styles.skeletonLine} style={{ width: '52%', height: '10px' }} />
                </div>
              </div>
            ))}
          </>
        ) : activities.length === 0 ? (
          <div className={styles.emptyState}>No recent activity yet.</div>
        ) : (
          activities.map((item: SalesActivity) => (
            <ActivityItem key={item.activity_id} item={item} />
          ))
        )}
      </div>

      {/* Footer action — always at the bottom, never scrolls away */}
      {!isLoading && (
        <button className={styles.viewMoreBtn} onClick={loadMore} disabled={!hasMore || isFetching}>
          {isFetching ? 'Loading…' : hasMore ? 'View more' : 'No more activities'}
        </button>
      )}
    </div>
  );
};

// ─── activity item ───────────────────────────────────────────────────────────

function ActivityItem({ item }: { item: SalesActivity }) {
  const config = getActivityConfig(item.activity_type);
  const isZoom = item.activity_type === 'zoom_transcript_ready';

  const { title, duration } = isZoom
    ? parseMeetingDescription(item.description ?? '')
    : { title: item.description ?? '', duration: null };

  return (
    <div className={styles.item}>
      {/* Icon bubble */}
      <div
        className={styles.iconBubble}
        style={{ '--bubble-color': config.color, '--bubble-bg': config.bg } as React.CSSProperties}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.itemHeader}>
          <span
            className={styles.typePill}
            style={{ '--pill-color': config.color, '--pill-bg': config.bg } as React.CSSProperties}
          >
            {config.icon}
            {config.label}
          </span>
          <span className={styles.itemTime}>{formatRelativeTime(item.created_at)}</span>
        </div>

        <p className={styles.itemTitle}>{truncate(title, 72)}</p>

        <div className={styles.itemMeta}>
          {item.host_email && (
            <span className={styles.metaChip}>
              <PersonIcon />
              {item.host_email}
            </span>
          )}
          {duration && (
            <span className={styles.metaChip}>
              <ClockIcon />
              {duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── icons ───────────────────────────────────────────────────────────────────

function VideoIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
