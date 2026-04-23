'use client';

import Link from 'next/link';
import styles from './CampaignDashboard.module.css';
import { useDashboardStats } from '@/hooks/useCampaignLeads';

const STAGE_LABELS: Record<string, string> = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  questionnaire_sent: 'Questionnaire Sent',
  meeting_booked: 'Meeting Booked',
  documents_generated: 'Documents',
  influencer_selection: 'Influencer Selection',
  deal_negotiation: 'Deal Negotiation',
  content_review: 'Content Review',
  live: 'Live',
};

function StatCardSkeleton() {
  return (
    <div className={styles.statCardSkeleton}>
      <div className={styles.statTop}>
        <div className={`${styles.shimmer} ${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        <div
          className={`${styles.shimmer}`}
          style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)' }}
        />
      </div>
      <div className={`${styles.shimmer} ${styles.skeletonLine} ${styles.skeletonLineLong}`} />
    </div>
  );
}

function ActionItemSkeleton() {
  return (
    <div className={styles.skeletonAction}>
      <div
        className={`${styles.shimmer}`}
        style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={`${styles.shimmer} ${styles.skeletonLine}`} style={{ width: '50%' }} />
        <div
          className={`${styles.shimmer} ${styles.skeletonLine}`}
          style={{ width: '80%', height: 11 }}
        />
      </div>
      <div
        className={`${styles.shimmer} ${styles.skeletonLine}`}
        style={{ width: 40, height: 11 }}
      />
    </div>
  );
}

export function CampaignDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      label: 'Active Leads',
      value: stats?.activeLeads ?? 0,
      iconClass: styles.statIconBlue,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary-600)"
          strokeWidth="1.8"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      iconClass: styles.statIconOrange,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f97316"
          strokeWidth="1.8"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      label: 'Meetings This Week',
      value: stats?.meetingsThisWeek ?? 0,
      iconClass: styles.statIconGreen,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-success-600)"
          strokeWidth="1.8"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: 'Influencers in Negotiation',
      value: stats?.influencersInNegotiation ?? 0,
      iconClass: styles.statIconPurple,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
          <path d="M17 11l1.5 1.5L21 10" />
        </svg>
      ),
    },
  ];

  const maxCount = Math.max(...(stats?.leadsPerStage?.map((s) => s.count) ?? [1]), 1);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Your campaign health at a glance</p>
      </header>

      {/* Stats */}
      <section className={styles.statsRow}>
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <div key={card.label} className={styles.statCard}>
                <div className={styles.statTop}>
                  <span className={styles.statLabel}>{card.label}</span>
                  <div className={`${styles.statIcon} ${card.iconClass}`}>{card.icon}</div>
                </div>
                <div className={styles.statValue}>{card.value}</div>
              </div>
            ))}
      </section>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Action Required */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Action Required</h2>
            {!isLoading && stats?.actionItems?.length ? (
              <span className={styles.sectionBadge}>{stats.actionItems.length}</span>
            ) : null}
          </div>
          <div className={styles.actionList}>
            {isLoading
              ? [1, 2, 3, 4, 5].map((i) => <ActionItemSkeleton key={i} />)
              : (stats?.actionItems ?? []).map((item) => (
                  <Link
                    key={item.id}
                    href={`/campaigns/leads/${item.leadId}`}
                    className={styles.actionItem}
                  >
                    <div
                      className={`${styles.urgencyDot} ${styles[`urgency${item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}` as keyof typeof styles]}`}
                    />
                    <div className={styles.actionContent}>
                      <div className={styles.actionLeadName}>{item.leadName}</div>
                      <div className={styles.actionDesc}>{item.description}</div>
                    </div>
                    <div className={styles.actionTime}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </Link>
                ))}
            {!isLoading && !stats?.actionItems?.length && (
              <div
                style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                All caught up — no actions pending
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Pipeline Summary */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Pipeline by Stage</h2>
            </div>
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className={styles.stageRow}>
                    <div
                      className={`${styles.shimmer} ${styles.skeletonLine}`}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))
              : (stats?.leadsPerStage ?? []).map((s) => (
                  <div key={s.stage} className={styles.stageRow}>
                    <span className={styles.stageLabel}>{STAGE_LABELS[s.stage] ?? s.label}</span>
                    <div className={styles.stageBar}>
                      <div
                        className={styles.stageBarFill}
                        style={{ width: `${(s.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className={styles.stageCount}>{s.count}</span>
                  </div>
                ))}
          </div>

          {/* Upcoming Meetings */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming Meetings</h2>
            </div>
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className={styles.meetingItem}>
                    <div
                      className={`${styles.shimmer}`}
                      style={{ width: 32, height: 32, borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div
                        className={`${styles.shimmer} ${styles.skeletonLine}`}
                        style={{ width: '55%' }}
                      />
                      <div
                        className={`${styles.shimmer} ${styles.skeletonLine}`}
                        style={{ width: '35%', height: 11 }}
                      />
                    </div>
                  </div>
                ))
              : (stats?.upcomingMeetings ?? []).map((m, i) => {
                  const initials = m.leadName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div key={i} className={styles.meetingItem}>
                      <div className={styles.meetingAvatar}>{initials}</div>
                      <div className={styles.meetingInfo}>
                        <div className={styles.meetingName}>{m.leadName}</div>
                        <div className={styles.meetingTime}>
                          {new Date(m.scheduledAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      {m.zoomLink && (
                        <a
                          href={m.zoomLink}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.meetingLink}
                        >
                          Join
                        </a>
                      )}
                    </div>
                  );
                })}
            {!isLoading && !stats?.upcomingMeetings?.length && (
              <div
                style={{
                  padding: 'var(--space-5)',
                  textAlign: 'center',
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                No upcoming meetings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
