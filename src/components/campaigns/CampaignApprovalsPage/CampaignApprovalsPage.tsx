'use client';

import Link from 'next/link';
import styles from './CampaignApprovalsPage.module.css';
import { useCampaignApprovals } from '@/hooks/useCampaignLeads';
import { campaignsService } from '@/services/campaigns.service';
import { useQueryClient } from '@tanstack/react-query';

const TYPE_ICONS = {
  document: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  influencer_list: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
    </svg>
  ),
  content: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
};

const TYPE_LABELS = {
  document: 'Document',
  influencer_list: 'Influencer List',
  content: 'Content',
};

function SkeletonCard() {
  return (
    <div className={styles.card} style={{ cursor: 'default' }}>
      <div
        className={styles.shimmer}
        style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={styles.shimmer} style={{ height: 14, width: '45%' }} />
        <div className={styles.shimmer} style={{ height: 11, width: '30%' }} />
      </div>
      <div className={styles.shimmer} style={{ height: 11, width: 60 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div
          className={styles.shimmer}
          style={{ height: 32, width: 72, borderRadius: 'var(--radius-lg)' }}
        />
        <div
          className={styles.shimmer}
          style={{ height: 32, width: 60, borderRadius: 'var(--radius-lg)' }}
        />
      </div>
    </div>
  );
}

export function CampaignApprovalsPage() {
  const { data: approvals, isLoading } = useCampaignApprovals();
  const qc = useQueryClient();

  async function handleApprove(id: string) {
    await campaignsService.approveItem(id);
    qc.invalidateQueries({ queryKey: ['campaign-approvals'] });
  }

  async function handleReject(id: string) {
    await campaignsService.rejectItem(id);
    qc.invalidateQueries({ queryKey: ['campaign-approvals'] });
  }

  const pending = (approvals ?? []).filter((a) => a.status === 'pending');

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Approvals</h1>
        <p className={styles.subtitle}>Items waiting for your action</p>
      </div>

      <div className={styles.list}>
        {isLoading
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : pending.map((item) => (
              <div key={item.id} className={styles.card}>
                <div
                  className={`${styles.typeIcon} ${styles[`type${item.type.charAt(0).toUpperCase() + item.type.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}` as keyof typeof styles]}`}
                >
                  {TYPE_ICONS[item.type] ?? TYPE_ICONS.document}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitle}>
                    <Link
                      href={`/campaigns/leads/${item.leadId}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {item.leadName}
                    </Link>
                    {' · '}
                    {TYPE_LABELS[item.type] ?? item.type}
                  </div>
                  <div className={styles.cardMeta}>
                    {item.clientCompany} · {item.description}
                  </div>
                </div>
                <div className={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.btn} ${styles.btnApprove}`}
                    onClick={() => handleApprove(item.id)}
                  >
                    Approve
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnReject}`}
                    onClick={() => handleReject(item.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
        {!isLoading && !pending.length && (
          <div className={styles.empty}>All caught up — nothing pending approval</div>
        )}
      </div>
    </div>
  );
}
