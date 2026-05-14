'use client';

import React, { useState } from 'react';
import styles from './InfluencerDiscovery.module.css';
import {
  useShortlist,
  useShortlistStats,
  useRunDiscovery,
  useUpdateShortlistEntry,
  useLoadNextBatch,
  useTransitionPhase,
  useBudgetPreview,
  useRecommendations,
  useRecommendationDecision,
} from '@/hooks/useCampaignLeads';
import type { RecommendationCreator } from '@/hooks/useCampaignLeads';
import type {
  ShortlistEntry,
  DiscoveryFilters,
  DiscoveryObjective,
  InfluencerTier,
} from '@/types/campaign.types';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const TIER_COLOR: Record<InfluencerTier, string> = {
  nano: '#6366f1',
  micro: '#8b5cf6',
  mid_tier: '#3b82f6',
  macro: '#f59e0b',
  mega: '#ef4444',
};

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className={styles.scoreBar}>
      <span className={styles.scoreBarLabel}>{label}</span>
      <div className={styles.scoreBarTrack}>
        <div className={styles.scoreBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.scoreBarValue}>{value.toFixed(1)}</span>
    </div>
  );
}

// ── Reject reason modal ───────────────────────────────────────────────────────
function RejectModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div
      className={styles.rejectBackdrop}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={styles.rejectModal}>
        <h3 className={styles.rejectTitle}>Rejection Reason</h3>
        <textarea
          className={styles.rejectTextarea}
          placeholder="e.g. Rate too high, wrong niche…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
          rows={3}
        />
        <div className={styles.rejectActions}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Creator card ──────────────────────────────────────────────────────────────
function CreatorCard({
  entry,
  onApprove,
  onReject,
  onHold,
  isPending,
}: {
  entry: ShortlistEntry;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onHold: () => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const color = avatarColor(entry.creator_name);
  const tierColor = TIER_COLOR[entry.estimated_tier] ?? '#888';
  const scorePercent = Math.round(entry.match_score * 10);

  const statusClass =
    entry.status === 'approved'
      ? styles.cardApproved
      : entry.status === 'rejected'
        ? styles.cardRejected
        : entry.status === 'on_hold'
          ? styles.cardOnHold
          : '';

  return (
    <>
      <div className={`${styles.creatorCard} ${statusClass}`}>
        {/* Status ribbon */}
        {entry.status !== 'pending' && (
          <div
            className={`${styles.ribbon} ${entry.status === 'approved' ? styles.ribbonApproved : entry.status === 'rejected' ? styles.ribbonRejected : styles.ribbonHold}`}
          >
            {entry.status === 'approved'
              ? '✓ Approved'
              : entry.status === 'rejected'
                ? '✕ Rejected'
                : '⏸ On Hold'}
          </div>
        )}

        {/* Top row */}
        <div className={styles.cardTop}>
          <div className={styles.cardAvatar} style={{ '--c': color } as React.CSSProperties}>
            {getInitials(entry.creator_name)}
          </div>
          <div className={styles.cardIdentity}>
            <span className={styles.cardName}>{entry.creator_name}</span>
            <div className={styles.cardHandles}>
              {entry.instagram_handle && (
                <span className={styles.handleIG}>@{entry.instagram_handle}</span>
              )}
              {entry.tiktok_handle && (
                <span className={styles.handleTT}>@{entry.tiktok_handle}</span>
              )}
            </div>
          </div>
          <div className={styles.cardRight}>
            <div
              className={styles.scoreRing}
              style={{ '--pct': `${scorePercent}%`, '--tier': tierColor } as React.CSSProperties}
            >
              <span className={styles.scoreValue}>{entry.match_score.toFixed(1)}</span>
            </div>
            <span className={styles.tier} style={{ color: tierColor }}>
              {entry.estimated_tier.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className={styles.cardMeta}>
          {entry.location && <span className={styles.metaChip}>📍 {entry.location}</span>}
          {entry.gender && <span className={styles.metaChip}>{entry.gender}</span>}
          {entry.age && <span className={styles.metaChip}>{entry.age} yrs</span>}
          {entry.languages && <span className={styles.metaChip}>🌐 {entry.languages}</span>}
        </div>

        {/* Stats row */}
        <div className={styles.cardStats}>
          <div className={styles.statCell}>
            <span className={styles.statVal}>{formatFollowers(entry.follower_count)}</span>
            <span className={styles.statLbl}>Followers</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statVal}>
              {entry.engagement_rate ? `${entry.engagement_rate.toFixed(1)}%` : '—'}
            </span>
            <span className={styles.statLbl}>Eng. Rate</span>
          </div>
          {entry.parsed_rate_ig && (
            <div className={styles.statCell}>
              <span className={styles.statVal}>${entry.parsed_rate_ig}</span>
              <span className={styles.statLbl}>IG Rate</span>
            </div>
          )}
          {entry.parsed_rate_tt && (
            <div className={styles.statCell}>
              <span className={styles.statVal}>${entry.parsed_rate_tt}</span>
              <span className={styles.statLbl}>TT Rate</span>
            </div>
          )}
          {entry.rate && !entry.parsed_rate_ig && !entry.parsed_rate_tt && (
            <div className={styles.statCell}>
              <span className={styles.statVal}>{entry.rate}</span>
              <span className={styles.statLbl}>Rate</span>
            </div>
          )}
        </div>

        {/* Niche */}
        {entry.niche && (
          <div className={styles.nicheRow}>
            {entry.niche
              .split(',')
              .map((n) => n.trim())
              .filter(Boolean)
              .slice(0, 4)
              .map((n, i) => (
                <span key={i} className={styles.nicheTag}>
                  {n}
                </span>
              ))}
          </div>
        )}

        {/* Reasoning toggle */}
        <button className={styles.reasoningToggle} onClick={() => setExpanded((p) => !p)}>
          {expanded ? '▲ Hide AI Analysis' : '▼ Show AI Analysis'}
        </button>

        {expanded && (
          <div className={styles.reasoning}>
            <p className={styles.reasoningText}>{entry.reasoning}</p>
            <div className={styles.scoreBars}>
              <ScoreBar label="Niche Match" value={entry.score_breakdown.niche_match} />
              <ScoreBar label="Budget Fit" value={entry.score_breakdown.budget_fit} />
              <ScoreBar label="Platform" value={entry.score_breakdown.platform_match} />
              <ScoreBar label="Location" value={entry.score_breakdown.location_match} />
              <ScoreBar label="Language" value={entry.score_breakdown.language_match} />
              <ScoreBar label="Engagement" value={entry.score_breakdown.engagement_rate} />
              <ScoreBar label="Data Quality" value={entry.score_breakdown.data_completeness} />
            </div>
            {entry.warnings && entry.warnings.length > 0 && (
              <div className={styles.warnings}>
                {entry.warnings.map((w, i) => (
                  <p key={i} className={styles.warning}>
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons — only for pending entries */}
        {entry.status === 'pending' && (
          <div className={styles.cardActions}>
            <button
              className={`${styles.btn} ${styles.btnApprove}`}
              onClick={onApprove}
              disabled={isPending}
            >
              ✓ Approve
            </button>
            <button
              className={`${styles.btn} ${styles.btnHold}`}
              onClick={onHold}
              disabled={isPending}
            >
              ⏸ Hold
            </button>
            <button
              className={`${styles.btn} ${styles.btnReject}`}
              onClick={() => setRejectOpen(true)}
              disabled={isPending}
            >
              ✕ Reject
            </button>
          </div>
        )}
        {entry.status === 'rejected' && entry.rejection_reason && (
          <p className={styles.rejectionReason}>Reason: {entry.rejection_reason}</p>
        )}
      </div>

      {rejectOpen && (
        <RejectModal
          onConfirm={(reason) => {
            setRejectOpen(false);
            onReject(reason);
          }}
          onCancel={() => setRejectOpen(false)}
        />
      )}
    </>
  );
}

// ── Stats sidebar ─────────────────────────────────────────────────────────────
function StatsSidebar({ campaignId, enabled }: { campaignId: string; enabled: boolean }) {
  const { data: stats } = useShortlistStats(campaignId, enabled);

  if (!stats?.has_shortlist) return null;

  const total = stats.total_entries || 1;
  const reviewedPct = Math.round(((total - (stats.by_status.pending ?? 0)) / total) * 100);

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Shortlist Stats</h3>

      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${reviewedPct}%` }} />
        </div>
        <span className={styles.progressLabel}>
          {total - (stats.by_status.pending ?? 0)}/{total} reviewed
        </span>
      </div>

      <div className={styles.statGrid}>
        <div className={`${styles.statBox} ${styles.statBoxApproved}`}>
          <span className={styles.statBoxVal}>{stats.by_status.approved ?? 0}</span>
          <span className={styles.statBoxLbl}>Approved</span>
        </div>
        <div className={`${styles.statBox} ${styles.statBoxPending}`}>
          <span className={styles.statBoxVal}>{stats.by_status.pending ?? 0}</span>
          <span className={styles.statBoxLbl}>Pending</span>
        </div>
        <div className={`${styles.statBox} ${styles.statBoxHold}`}>
          <span className={styles.statBoxVal}>{stats.by_status.on_hold ?? 0}</span>
          <span className={styles.statBoxLbl}>On Hold</span>
        </div>
        <div className={`${styles.statBox} ${styles.statBoxRejected}`}>
          <span className={styles.statBoxVal}>{stats.by_status.rejected ?? 0}</span>
          <span className={styles.statBoxLbl}>Rejected</span>
        </div>
      </div>

      <div className={styles.budgetSection}>
        <h4 className={styles.budgetTitle}>Budget</h4>
        <div className={styles.budgetRow}>
          <span>Total</span>
          <span>${stats.total_budget?.toLocaleString() ?? '—'}</span>
        </div>
        <div className={styles.budgetRow}>
          <span>Used</span>
          <span className={styles.budgetUsed}>
            ${stats.approved_budget_used?.toLocaleString() ?? '—'}
          </span>
        </div>
        <div className={styles.budgetRow}>
          <span>Remaining</span>
          <span className={styles.budgetRemaining}>
            ${stats.budget_remaining?.toLocaleString() ?? '—'}
          </span>
        </div>
      </div>

      {Object.entries(stats.by_tier ?? {}).some(([, v]) => (v ?? 0) > 0) && (
        <div className={styles.tierSection}>
          <h4 className={styles.budgetTitle}>By Tier</h4>
          {(Object.entries(stats.by_tier) as [InfluencerTier, number][])
            .filter(([, v]) => v > 0)
            .map(([tier, count]) => (
              <div key={tier} className={styles.tierRow}>
                <span className={styles.tierDot} style={{ background: TIER_COLOR[tier] }} />
                <span className={styles.tierName}>{tier.replace('_', ' ')}</span>
                <span className={styles.tierCount}>{count}</span>
              </div>
            ))}
        </div>
      )}

      {stats.is_fully_approved && <div className={styles.fullyApproved}>✓ Fully Approved</div>}
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────────
function RecommendationCard({
  creator,
  decision,
  onDecision,
  isPending,
}: {
  creator: RecommendationCreator;
  decision?: 'accepted' | 'rejected';
  onDecision: (creatorId: string, decision: 'accepted' | 'rejected') => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const color = avatarColor(creator.name);

  return (
    <div
      className={`${styles.recCard} ${decision === 'accepted' ? styles.recCardAccepted : decision === 'rejected' ? styles.recCardRejected : ''}`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardAvatar} style={{ '--c': color } as React.CSSProperties}>
          {getInitials(creator.name)}
        </div>
        <div className={styles.cardIdentity}>
          <span className={styles.cardName}>{creator.name}</span>
          <div className={styles.cardHandles}>
            {creator.instagram_handle && (
              <a
                className={styles.handleIG}
                href={`https://instagram.com/${creator.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{creator.instagram_handle}
              </a>
            )}
            {creator.tiktok_handle && (
              <a
                className={styles.handleTT}
                href={`https://tiktok.com/@${creator.tiktok_handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{creator.tiktok_handle}
              </a>
            )}
          </div>
        </div>
        <div className={styles.cardRight}>
          <div
            className={styles.scoreRing}
            style={
              {
                '--pct': `${Math.round(creator.recommendation_score)}%`,
                '--tier': TIER_COLOR[(creator.tier as InfluencerTier) ?? 'nano'] ?? '#888',
              } as React.CSSProperties
            }
          >
            <span className={styles.scoreValue}>{creator.recommendation_score.toFixed(1)}</span>
          </div>
          <span
            className={styles.tier}
            style={{
              color: TIER_COLOR[creator.tier as InfluencerTier] ?? '#888',
            }}
          >
            {creator.tier.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className={styles.cardMeta}>
        {creator.country && <span className={styles.metaChip}>📍 {creator.country}</span>}
        {(creator.languages?.length ?? 0) > 0 && (
          <span className={styles.metaChip}>🌐 {creator.languages!.join(', ')}</span>
        )}
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statCell}>
          <span className={styles.statVal}>
            {formatFollowers(creator.instagram_followers ?? undefined)}
          </span>
          <span className={styles.statLbl}>IG Followers</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statVal}>
            {formatFollowers(creator.tiktok_followers ?? undefined)}
          </span>
          <span className={styles.statLbl}>TT Followers</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statVal}>
            {creator.engagement_rate != null ? `${creator.engagement_rate.toFixed(1)}%` : '—'}
          </span>
          <span className={styles.statLbl}>Eng. Rate</span>
        </div>
      </div>

      {(creator.niches?.length ?? 0) > 0 && (
        <div className={styles.nicheRow}>
          {creator.niches!.slice(0, 4).map((n, i) => (
            <span key={i} className={styles.nicheTag}>
              {n}
            </span>
          ))}
        </div>
      )}

      <button className={styles.reasoningToggle} onClick={() => setExpanded((p) => !p)}>
        {expanded ? '▲ Hide AI Reasoning' : '▼ Show AI Reasoning'}
      </button>

      {expanded && (
        <div className={styles.reasoning}>
          <p className={styles.reasoningText}>{creator.selection_reason}</p>
          <div className={styles.scoreBars}>
            <ScoreBar label="Niche" value={creator.score_breakdown.niche} />
            <ScoreBar label="Engagement" value={creator.score_breakdown.engagement} />
            <ScoreBar label="Completeness" value={creator.score_breakdown.completeness} />
          </div>
        </div>
      )}

      {decision === 'accepted' && <div className={styles.acceptedBadge}>✓ Accepted</div>}

      {!decision && (
        <div className={styles.cardActions}>
          <button
            className={`${styles.btn} ${styles.btnApprove}`}
            onClick={() => onDecision(creator.creator_id, 'accepted')}
            disabled={isPending}
          >
            ✓ Accept
          </button>
          <button
            className={`${styles.btn} ${styles.btnReject}`}
            onClick={() => onDecision(creator.creator_id, 'rejected')}
            disabled={isPending}
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ── Recommendations section ───────────────────────────────────────────────────
function RecommendationsSection({ leadId }: { leadId: string }) {
  const { data, isLoading, error, refetch } = useRecommendations(leadId);
  const { mutate: decide, isPending } = useRecommendationDecision(leadId);
  const [optimistic, setOptimistic] = React.useState<Record<string, 'accepted' | 'rejected'>>({});

  function handleDecision(creatorId: string, decision: 'accepted' | 'rejected') {
    if (!data) return;
    setOptimistic((prev) => ({ ...prev, [creatorId]: decision }));
    decide(
      { recommendationId: data.requirement_id, creatorId, decision },
      { onSuccess: () => refetch() }
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.shimmer} ${styles.skeletonCard}`} />
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  const { extracted_requirements: req, matched_creators: creators, documents_used } = data;

  return (
    <div className={styles.recSection}>
      <div className={styles.recHeader}>
        <h3 className={styles.recTitle}>AI Recommendations</h3>
        {documents_used && (
          <span className={styles.recMeta}>
            Based on {documents_used.kol_briefs} brief · {documents_used.proposals} proposals ·{' '}
            {documents_used.meetings_total} meetings
          </span>
        )}
      </div>

      {req && (
        <div className={styles.recReqRow}>
          {req.platforms?.map((p) => (
            <span key={p} className={`${styles.chip} ${styles.chipActive}`}>
              {p}
            </span>
          ))}
          {req.niches?.map((n) => (
            <span key={n} className={styles.nicheTag}>
              {n}
            </span>
          ))}
          {req.min_engagement_rate > 0 && (
            <span className={styles.metaChip}>Min Eng: {req.min_engagement_rate}%</span>
          )}
        </div>
      )}

      {req?.additional_notes && (
        <details className={styles.recNotes}>
          <summary className={styles.reasoningToggle}>▼ Campaign Notes</summary>
          <p className={styles.reasoningText}>{req.additional_notes}</p>
        </details>
      )}

      <div className={styles.creatorGrid}>
        {creators.map((c) => (
          <RecommendationCard
            key={c.creator_id}
            creator={c}
            decision={
              optimistic[c.creator_id] ??
              (c.status === 'accepted' || c.status === 'rejected' ? c.status : undefined)
            }
            onDecision={handleDecision}
            isPending={isPending}
          />
        ))}
      </div>
    </div>
  );
}

// ── Discovery form (unused — kept for future use) ─────────────────────────────
const OBJECTIVES: { value: DiscoveryObjective; label: string }[] = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'content_creation', label: 'Content Creation' },
];

const TIERS: InfluencerTier[] = ['nano', 'micro', 'mid_tier', 'macro', 'mega'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DiscoveryForm({ campaignId, onSuccess }: { campaignId: string; onSuccess: () => void }) {
  const [budget, setBudget] = useState('');
  const [objective, setObjective] = useState<DiscoveryObjective>('brand_awareness');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [niches, setNiches] = useState('');
  const [locations, setLocations] = useState('');
  const [languages, setLanguages] = useState('');
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minEngagement, setMinEngagement] = useState('');
  const [tiers, setTiers] = useState<InfluencerTier[]>([]);
  const [batchSize, setBatchSize] = useState('15');

  const { data: preview } = useBudgetPreview(campaignId, Number(budget) || 0, objective);

  const { mutate: runDiscovery, isPending, error } = useRunDiscovery(campaignId);

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function toggleTier(t: InfluencerTier) {
    setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filters: DiscoveryFilters = {
      ...(budget ? { total_budget: Number(budget) } : {}),
      objective,
      platforms: platforms.length ? platforms : undefined,
      niches: niches
        ? niches
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      locations: locations
        ? locations
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      languages: languages
        ? languages
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      gender: gender || undefined,
      min_age: minAge ? Number(minAge) : undefined,
      max_age: maxAge ? Number(maxAge) : undefined,
      min_engagement_rate: minEngagement ? Number(minEngagement) : undefined,
      preferred_tiers: tiers.length ? tiers : undefined,
      max_results_per_batch: Number(batchSize) || 15,
    };
    runDiscovery(filters, { onSuccess });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        {/* Budget */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Total Budget (SGD)</label>
          <input
            className={styles.formInput}
            type="number"
            placeholder="e.g. 40000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {/* Objective */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Objective</label>
          <select
            className={styles.formSelect}
            value={objective}
            onChange={(e) => setObjective(e.target.value as DiscoveryObjective)}
          >
            {OBJECTIVES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Platforms */}
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.formLabel}>Platforms</label>
          <div className={styles.chipRow}>
            {['instagram', 'tiktok', 'youtube'].map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.chip} ${platforms.includes(p) ? styles.chipActive : ''}`}
                onClick={() => togglePlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Niches */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Niches <span className={styles.formHint}>(comma-separated)</span>
          </label>
          <input
            className={styles.formInput}
            placeholder="beauty, lifestyle, food"
            value={niches}
            onChange={(e) => setNiches(e.target.value)}
          />
        </div>

        {/* Locations */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Locations <span className={styles.formHint}>(comma-separated)</span>
          </label>
          <input
            className={styles.formInput}
            placeholder="Singapore, Malaysia"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
          />
        </div>

        {/* Languages */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Languages <span className={styles.formHint}>(comma-separated)</span>
          </label>
          <input
            className={styles.formInput}
            placeholder="English, Chinese"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Gender</label>
          <select
            className={styles.formSelect}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Any</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>

        {/* Age range */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Age Range</label>
          <div className={styles.rangeRow}>
            <input
              className={styles.formInput}
              type="number"
              placeholder="Min"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
            />
            <span className={styles.rangeSep}>–</span>
            <input
              className={styles.formInput}
              type="number"
              placeholder="Max"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
            />
          </div>
        </div>

        {/* Min engagement */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Min Engagement Rate (%)</label>
          <input
            className={styles.formInput}
            type="number"
            step="0.1"
            placeholder="e.g. 2.0"
            value={minEngagement}
            onChange={(e) => setMinEngagement(e.target.value)}
          />
        </div>

        {/* Batch size */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Batch Size</label>
          <input
            className={styles.formInput}
            type="number"
            min="5"
            max="50"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
          />
        </div>

        {/* Preferred tiers */}
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.formLabel}>Preferred Tiers</label>
          <div className={styles.chipRow}>
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.chip} ${tiers.includes(t) ? styles.chipActive : ''}`}
                style={
                  tiers.includes(t)
                    ? {
                        borderColor: TIER_COLOR[t],
                        background: TIER_COLOR[t] + '20',
                        color: TIER_COLOR[t],
                      }
                    : {}
                }
                onClick={() => toggleTier(t)}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget preview */}
      {preview && preview.allocations?.length > 0 && (
        <div className={styles.budgetPreview}>
          <h4 className={styles.previewTitle}>Budget Allocation Preview</h4>
          <div className={styles.previewGrid}>
            {preview.allocations.map((a) => (
              <div key={a.tier} className={styles.previewCard}>
                <span className={styles.previewTier} style={{ color: TIER_COLOR[a.tier] }}>
                  {a.tier.replace('_', ' ')}
                </span>
                <span className={styles.previewAmount}>${a.budget_amount.toLocaleString()}</span>
                <span className={styles.previewRange}>{a.rate_range}</span>
                <span className={styles.previewCount}>
                  {a.estimated_count} est · {a.available_in_db} available
                </span>
              </div>
            ))}
          </div>
          {preview.warnings?.map((w, i) => (
            <p key={i} className={styles.warning}>
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {error && <p className={styles.error}>Failed to run discovery. Please try again.</p>}

      <button className={`${styles.btn} ${styles.btnFind}`} type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <span className={styles.spinner} /> Finding Influencers…
          </>
        ) : (
          '🔍 Find Influencers'
        )}
      </button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function InfluencerDiscovery({ leadId }: { leadId: string }) {
  const [tab, setTab] = useState<'discover' | 'shortlist'>('discover');

  const shortlistEnabled = tab === 'shortlist';
  const { data: shortlistData, isLoading: shortlistLoading } = useShortlist(
    leadId,
    undefined,
    shortlistEnabled
  );
  const { mutate: updateEntry, isPending: isUpdating } = useUpdateShortlistEntry(leadId);
  const { mutate: loadNext, isPending: loadingNext } = useLoadNextBatch(leadId);
  const { mutate: transition, isPending: transitioning } = useTransitionPhase(leadId);
  const { data: stats } = useShortlistStats(leadId, shortlistEnabled);

  const entries = shortlistData?.entries ?? [];
  const hasShortlist = entries.length > 0;

  function handleApprove(entryId: string) {
    updateEntry({ entryId, status: 'approved' });
  }

  function handleReject(entryId: string, reason: string) {
    updateEntry({ entryId, status: 'rejected', rejection_reason: reason });
  }

  function handleHold(entryId: string) {
    updateEntry({ entryId, status: 'on_hold' });
  }

  return (
    <div className={styles.root}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Influencer Discovery</h2>
          <p className={styles.pageSubtitle}>AI-powered shortlisting for this campaign</p>
        </div>
        {stats?.can_proceed_to_outreach && (
          <button
            className={`${styles.btn} ${styles.btnOutreach}`}
            disabled={transitioning}
            onClick={() =>
              transition({ targetPhase: 'outreach', reason: 'Shortlist fully approved' })
            }
          >
            {transitioning ? 'Moving…' : '→ Proceed to Outreach'}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'discover' ? styles.tabActive : ''}`}
          onClick={() => setTab('discover')}
        >
          Discovery
        </button>
        <button
          className={`${styles.tab} ${tab === 'shortlist' ? styles.tabActive : ''}`}
          onClick={() => setTab('shortlist')}
        >
          Shortlist {hasShortlist && <span className={styles.tabBadge}>{entries.length}</span>}
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* ── Discovery tab ── */}
          {tab === 'discover' && <RecommendationsSection leadId={leadId} />}

          {/* ── Shortlist tab ── */}
          {tab === 'shortlist' && (
            <>
              {shortlistLoading ? (
                <div className={styles.loadingState}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`${styles.shimmer} ${styles.skeletonCard}`} />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No shortlist yet. Run Discovery to find matching influencers.</p>
                  <button
                    className={`${styles.btn} ${styles.btnFind}`}
                    onClick={() => setTab('discover')}
                  >
                    Run Discovery
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.creatorGrid}>
                    {entries.map((entry) => (
                      <CreatorCard
                        key={entry.entry_id}
                        entry={entry}
                        onApprove={() => handleApprove(entry.entry_id)}
                        onReject={(reason) => handleReject(entry.entry_id, reason)}
                        onHold={() => handleHold(entry.entry_id)}
                        isPending={isUpdating}
                      />
                    ))}
                  </div>

                  {shortlistData?.shortlist?.batch_count != null && (
                    <div className={styles.batchActions}>
                      <p className={styles.batchInfo}>
                        Batch {shortlistData.shortlist.batch_count} ·{' '}
                        {entries.filter((e) => e.status === 'pending').length} pending review
                      </p>
                      <button
                        className={`${styles.btn} ${styles.btnGhost}`}
                        disabled={loadingNext}
                        onClick={() => loadNext({ max_results: 15 })}
                      >
                        {loadingNext ? (
                          <>
                            <span className={styles.spinner} /> Loading…
                          </>
                        ) : (
                          '+ Load More'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <StatsSidebar campaignId={leadId} enabled={shortlistEnabled} />
      </div>
    </div>
  );
}
