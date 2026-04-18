'use client';

import styles from './page.module.css';
import { useApprovals } from '@/hooks/useApprovals';
import type { IntelligenceCall } from '@/types/intelligence.types';
import { cn } from '@/lib/utils';

function OutcomeChip({ outcome }: { outcome: string }) {
  const cls =
    outcome === 'positive'
      ? styles.outcomePositive
      : outcome === 'negative'
        ? styles.outcomeNegative
        : styles.outcomeNeutral;
  return (
    <span className={cn(styles.outcomeChip, cls)}>
      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
    </span>
  );
}

function ApprovalCard({ call }: { call: IntelligenceCall }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.leadInfo}>
          <p className={styles.leadName}>{call.lead_name}</p>
          <p className={styles.leadCompany}>{call.lead_company}</p>
        </div>
        <OutcomeChip outcome={call.call_outcome} />
      </div>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Call ID:</span> {call.call_id}
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Meeting ID:</span> {call.meeting_id}
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Platform:</span> {call.platform}
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Duration:</span> {call.duration}
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Analysed by:</span> {call.analyzed_by}
        </span>
      </div>

      {call.call_summary && (
        <div className={styles.summary}>
          <p className={styles.summaryLabel}>Call Summary</p>
          <p className={styles.summaryText}>{call.call_summary}</p>
        </div>
      )}

      {call.client_needs && (
        <div className={styles.clientNeeds}>
          <p className={styles.summaryLabel}>Client Needs</p>
          <p className={styles.summaryText}>{call.client_needs}</p>
        </div>
      )}

      <div className={styles.cardActions}>
        <button className={styles.btnReject} disabled>
          Reject
        </button>
        <button className={styles.btnApprove} disabled>
          Approve
        </button>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const { data, isLoading, isError } = useApprovals();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading pending approvals…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>Failed to load approvals. Please try again.</div>
      </div>
    );
  }

  const calls = data?.calls ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Approvals
            {calls.length > 0 && <span className={styles.badge}>{calls.length}</span>}
          </h1>
          <p className={styles.subtitle}>
            Proposals pending your review from sales intelligence calls
          </p>
        </div>
      </div>

      {calls.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className={styles.emptyTitle}>All caught up!</p>
          <p className={styles.emptyText}>No proposals are pending approval right now.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {calls.map((call) => (
            <ApprovalCard key={call.call_id} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}
