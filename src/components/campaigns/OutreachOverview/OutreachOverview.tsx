'use client';

import styles from './OutreachOverview.module.css';
import { useNegotiationSummary, useOutreachAnalytics } from '@/hooks/useOutreach';
import { formatMoney, negotiationStatusMeta } from '@/lib/outreach';

interface OutreachOverviewProps {
  leadId: string;
}

export const OutreachOverview = ({ leadId }: OutreachOverviewProps) => {
  const { data: analytics, isLoading: loadingA } = useOutreachAnalytics(leadId);
  const { data: summary, isLoading: loadingS } = useNegotiationSummary(leadId);

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Outreach Activity</h3>
        {loadingA ? (
          <div className={styles.loading}>Loading…</div>
        ) : analytics ? (
          <>
            <div className={styles.statGrid}>
              <Stat label="Total Messages" value={analytics.total_messages} />
              <Stat label="Sent" value={analytics.sent_count} tone="success" />
              <Stat label="Drafts" value={analytics.draft_count} tone="warning" />
              <Stat label="Send Rate" value={`${analytics.send_rate}%`} tone="info" />
            </div>
            {analytics.negotiation_breakdown &&
              Object.keys(analytics.negotiation_breakdown).length > 0 && (
                <div className={styles.breakdown}>
                  {Object.entries(analytics.negotiation_breakdown).map(([key, count]) => {
                    const meta = negotiationStatusMeta(key);
                    return (
                      <span
                        key={key}
                        className={`${styles.breakChip} ${styles[`tone_${meta.tone}`]}`}
                      >
                        {meta.label}
                        <strong>{count}</strong>
                      </span>
                    );
                  })}
                </div>
              )}
          </>
        ) : (
          <div className={styles.loading}>No analytics yet.</div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Deal Outcomes</h3>
        {loadingS ? (
          <div className={styles.loading}>Loading…</div>
        ) : summary ? (
          <div className={styles.statGrid}>
            <Stat label="Creators" value={summary.total_creators} />
            <Stat label="Confirmed" value={summary.confirmed} tone="success" />
            <Stat label="Negotiating" value={summary.negotiating} tone="warning" />
            <Stat label="Declined" value={summary.declined} tone="danger" />
            <Stat label="Avg Closing" value={formatMoney(summary.avg_closing_amount)} />
            <Stat
              label="Total Closed"
              value={formatMoney(summary.total_closed_value)}
              tone="success"
            />
          </div>
        ) : (
          <div className={styles.loading}>No deals yet.</div>
        )}
      </section>
    </div>
  );
};

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}) {
  return (
    <div className={styles.stat}>
      <div className={`${styles.statValue} ${styles[`tone_${tone}`]}`}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
