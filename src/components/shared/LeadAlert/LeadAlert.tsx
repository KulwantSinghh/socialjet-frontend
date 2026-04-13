'use client';

import styles from './LeadAlert.module.css';
import { Button } from '@/components/ui/Button';
import { useLeadAlerts } from '@/hooks/useLeadAlerts';
import type { LeadAlert as LeadAlertType } from '@/types/leads.types';

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'Whatsapp',
  contact_form: 'Web Form',
  calendly: 'Calendly',
  manual: 'Manual',
};

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function AlertCard({ alert }: { alert: LeadAlertType }) {
  return (
    <div className={styles.card}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>👤</div>
        <div className={styles.details}>
          <h4 className={styles.userName}>{alert.name || 'Unknown Lead'}</h4>
          <p className={styles.userRole}>
            {SOURCE_LABELS[alert.source] ?? capitalize(alert.source)}
          </p>
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status:</span>
          <span className={styles.metaValue}>{capitalize(alert.status)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Source:</span>
          <span className={styles.metaValue}>
            {SOURCE_LABELS[alert.source] ?? capitalize(alert.source)}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button className={styles.fastTrackBtn}>View More</Button>
        <span className={styles.time}>{relativeTime(alert.created_at)}</span>
      </div>
    </div>
  );
}

export const LeadAlert = () => {
  const { data, isLoading } = useLeadAlerts();

  const latestAlert = data?.alerts
    ? [...data.alerts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.icon}>⚡</span>
          <h3 className={styles.title}>New Lead Alerts</h3>
        </div>
        <span className={styles.badge}>Last 24h</span>
      </div>

      {isLoading && (
        <div className={styles.card}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>👤</div>
            <div className={styles.details}>
              <h4 className={styles.userName}>Loading…</h4>
              <p className={styles.userRole}>—</p>
            </div>
          </div>
          <div className={styles.meta} />
          <div className={styles.actions}>
            <Button className={styles.fastTrackBtn}>View More</Button>
          </div>
        </div>
      )}

      {!isLoading && latestAlert && <AlertCard alert={latestAlert} />}

      {!isLoading && !latestAlert && (
        <div className={styles.card}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>👤</div>
            <div className={styles.details}>
              <h4 className={styles.userName}>No new alerts</h4>
              <p className={styles.userRole}>Check back soon</p>
            </div>
          </div>
          <div className={styles.meta} />
          <div className={styles.actions}>
            <Button className={styles.fastTrackBtn}>View More</Button>
          </div>
        </div>
      )}
    </div>
  );
};
