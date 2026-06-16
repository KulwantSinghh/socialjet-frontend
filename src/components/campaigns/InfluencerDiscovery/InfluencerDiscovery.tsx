'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  useClientApprovedCreators,
} from '@/hooks/useCampaignLeads';
import type {
  RecommendationCreator,
  RecommendationInstagramPost,
  RecommendationsResponse,
  ClientApprovedCreator,
} from '@/hooks/useCampaignLeads';
import type {
  ShortlistEntry,
  DiscoveryFilters,
  DiscoveryObjective,
  InfluencerTier,
  CampaignLeadStage,
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
  const semanticScore =
    'semantic' in entry.score_breakdown && typeof entry.score_breakdown.semantic === 'number'
      ? entry.score_breakdown.semantic
      : entry.score_breakdown.niche_match;

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
              <ScoreBar label="Semantic" value={semanticScore} />
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

// ── Circular score rings ─────────────────────────────────────────────────────

function ringColor(val: number, max: number): string {
  const pct = val / max;
  if (pct >= 0.6) return '#10b981';
  if (pct >= 0.3) return '#f59e0b';
  return '#94a3b8';
}

function ScoreRing({
  label,
  value: rawValue,
  max: rawMax,
  size = 52,
  stroke = 4,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const value = Number.isFinite(rawValue) ? (rawValue as number) : 0;
  const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 1;

  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const offset = animated ? circ * (1 - pct) : circ;
  const color = ringColor(value, max);
  const cx = size / 2;

  return (
    <div className={styles.scoreRingItem} title={`${label}: ${value}`}>
      <svg
        width={size}
        height={size}
        style={{ display: 'block', filter: `drop-shadow(0 0 6px ${color}55)` }}
      >
        {/* track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={stroke} />
        {/* fill */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <text
          x={cx}
          y={cx}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size > 56 ? 13 : 11}
          fontWeight="700"
          fill={color}
        >
          {value % 1 === 0 ? value : value.toFixed(1)}
        </text>
      </svg>
      <span className={styles.scoreRingLabel}>{label.replace(/_/g, ' ')}</span>
    </div>
  );
}

function ScoreBurst({
  scoreEntries,
  totalScore,
  selectionReason,
}: {
  scoreEntries: [string, number][];
  totalScore: number;
  selectionReason?: string;
}) {
  const maxTotal = 100;
  const sorted = [...scoreEntries].sort(([, a], [, b]) => b - a);
  const maxVal = Math.max(...scoreEntries.map(([, v]) => v), 1);

  return (
    <div className={styles.scoreBurst}>
      {/* Total score — large ring */}
      <div className={styles.scoreBurstTotal}>
        <ScoreRing label="Total" value={totalScore} max={maxTotal} size={72} stroke={5} />
      </div>
      {/* Per-dimension rings */}
      <div className={styles.scoreBurstGrid}>
        {sorted.map(([key, val]) => (
          <ScoreRing key={key} label={key} value={val} max={maxVal} size={52} stroke={4} />
        ))}
      </div>
      {selectionReason && <p className={styles.modalSelectionReason}>{selectionReason}</p>}
    </div>
  );
}

// ── Post cell (image + inline video for reels) ───────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function PostCell({ post, isReel }: { post: RecommendationInstagramPost; isReel: boolean }) {
  const [playing, setPlaying] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Pause the media element before React removes it. A playing <video> performs
  // async DOM work; if it's torn down mid-commit (e.g. the modal closes or the
  // stage switches while a reel plays) the browser can desync from React's tree
  // and throw "Cannot read properties of null (reading 'removeChild')".
  React.useEffect(() => {
    if (!playing) return;
    const v = videoRef.current;
    return () => {
      try {
        v?.pause();
      } catch {
        /* element already detached */
      }
    };
  }, [playing]);

  // Build two source URLs — browser tries them in order natively via <source> elements
  const proxySrc = post.link ? `/api/proxy-video?url=${encodeURIComponent(post.link)}` : null;
  const isVideoPost = post.type === 'reel';
  const hasStats = post.likes != null || post.views != null || post.comments != null;

  function handlePlay() {
    setFailed(false);
    setPlaying(true);
    setPaused(false);
  }

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }

  function handleMuteToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  // All <source> elements errored — video is truly unavailable (expired URL etc.)
  function handleVideoError() {
    setPlaying(false);
    setFailed(true);
  }

  return (
    <div className={`${styles.postThumb} ${isReel ? styles.postThumbReel : ''}`}>
      {/* ── media ── */}
      {isVideoPost && playing ? (
        <video
          key="reel-video"
          ref={videoRef}
          className={styles.postThumbImg}
          loop
          playsInline
          autoPlay
          muted={muted}
          onError={handleVideoError}
          onClick={handleToggle}
          style={{ cursor: 'pointer', background: '#000' }}
        >
          {/* Browser tries direct CDN first (instant), proxy second (server-side) */}
          {post.link && <source src={post.link} type="video/mp4" />}
          {proxySrc && <source src={proxySrc} type="video/mp4" />}
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key="reel-img"
          src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnail)}`}
          alt={post.caption?.slice(0, 40) ?? 'post'}
          className={styles.postThumbImg}
          loading="lazy"
        />
      )}

      {/* play button — shown when not playing */}
      {isVideoPost && !playing && (
        <button
          className={styles.reelPlayBtn}
          onClick={failed ? undefined : handlePlay}
          aria-label="Play reel"
          style={failed ? { cursor: 'default' } : undefined}
        >
          {failed ? (
            <span className={styles.reelExpiredLabel}>
              Link
              <br />
              expired
            </span>
          ) : (
            <span className={styles.reelPlayCircle}>
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </button>
      )}

      {/* controls while playing */}
      {isVideoPost && playing && (
        <div className={styles.reelControls}>
          <button
            className={styles.reelControlBtn}
            onClick={handleToggle}
            aria-label={paused ? 'Play' : 'Pause'}
          >
            {paused ? (
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
          <button
            className={styles.reelControlBtn}
            onClick={handleMuteToggle}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* type badge */}
      {!playing && post.type === 'reel' && <span className={styles.postTypeIcon}>▶</span>}
      {!playing && post.type === 'carousel' && <span className={styles.postTypeIcon}>⧉</span>}

      {/* always-visible stats */}
      {hasStats && (
        <div className={styles.postStatsBar}>
          {post.likes != null && (
            <span className={styles.postStat}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {fmtNum(post.likes)}
            </span>
          )}
          {post.views != null && (
            <span className={styles.postStat}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                <path d="M8 5v14l11-7z" />
              </svg>
              {fmtNum(post.views)}
            </span>
          )}
          {post.comments != null && (
            <span className={styles.postStat}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {fmtNum(post.comments)}
            </span>
          )}
        </div>
      )}

      {/* caption on hover */}
      {post.caption && !playing && (
        <div className={styles.postCaption}>
          {post.caption.slice(0, 80)}
          {post.caption.length > 80 ? '…' : ''}
        </div>
      )}
    </div>
  );
}

// ── Creator detail modal ─────────────────────────────────────────────────────
function proxyUrl(url: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

function CreatorDetailModal({
  creator,
  onClose,
  onDecision,
  decision,
  isPending,
}: {
  creator: RecommendationCreator;
  onClose: () => void;
  onDecision?: (creatorId: string, decision: 'accepted' | 'rejected') => void;
  decision?: 'accepted' | 'rejected';
  isPending?: boolean;
}) {
  const color = avatarColor(creator.name);
  const [imgError, setImgError] = React.useState(false);
  const tierColor = TIER_COLOR[(creator.tier as InfluencerTier) ?? 'nano'] ?? '#888';
  const allPosts = creator.searchapi_data?.instagram?.posts ?? [];
  const reels = allPosts.filter((p) => p.type === 'reel');
  const [activeTab, setActiveTab] = React.useState<'posts' | 'reels'>('posts');
  const displayedPosts = activeTab === 'reels' ? reels : allPosts;

  const bioLinks = creator.searchapi_data?.instagram?.profile?.bio_links ?? [];
  const externalLink =
    creator.external_link ?? creator.searchapi_data?.instagram?.profile?.external_link;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const semanticScore =
    typeof creator.score_breakdown.semantic === 'number'
      ? creator.score_breakdown.semantic
      : typeof creator.score_breakdown.niche === 'number'
        ? creator.score_breakdown.niche
        : 0;

  const normalizedBreakdown = {
    ...creator.score_breakdown,
    semantic: semanticScore,
  };

  const scoreEntries = (Object.entries(normalizedBreakdown) as [string, unknown][])
    .filter(([key, v]) => key !== 'niche' && typeof v === 'number' && (v as number) > 0)
    .map(([key, v]) => [key, v as number] as [string, number]);

  return (
    <div
      className={styles.modalBackdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modalBox}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* ── Profile header ── */}
        <div className={styles.modalProfileHeader}>
          <div className={styles.modalAvatarRing}>
            <div className={styles.modalAvatarRingInner}>
              {creator.profile_picture && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxyUrl(creator.profile_picture)}
                  alt={creator.name}
                  className={styles.modalAvatarImg}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className={styles.modalAvatarFallback}
                  style={{ '--c': color } as React.CSSProperties}
                >
                  {getInitials(creator.name)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalProfileMeta}>
            <div className={styles.modalUsernameRow}>
              <span className={styles.modalUsername}>{creator.name}</span>
              {creator.is_verified && <span className={styles.verifiedBadge}>✔</span>}
              <span
                className={styles.modalTierBadge}
                style={{ color: tierColor, borderColor: tierColor }}
              >
                {creator.tier.replace('_', ' ')}
              </span>
              {creator.instagram_handle && (
                <span className={styles.igSourceBadge} title="Data from Instagram">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    width="14"
                    height="14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.6" fill="none" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                    <defs>
                      <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="35%" stopColor="#e6683c" />
                        <stop offset="60%" stopColor="#dc2743" />
                        <stop offset="80%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Instagram
                </span>
              )}
            </div>

            <div className={styles.modalHandles}>
              {creator.instagram_handle && (
                <a
                  className={styles.modalIgHandle}
                  href={`https://instagram.com/${creator.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{creator.instagram_handle}
                </a>
              )}
              {creator.tiktok_handle && (
                <a
                  className={styles.modalTtHandle}
                  href={`https://tiktok.com/@${creator.tiktok_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{creator.tiktok_handle}
                </a>
              )}
            </div>

            {creator.bio && <p className={styles.modalBio}>{creator.bio}</p>}

            {(externalLink || bioLinks.length > 0) && (
              <div className={styles.modalLinks}>
                {externalLink && (
                  <a
                    className={styles.modalLink}
                    href={externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 {externalLink.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {bioLinks
                  .filter((l) => l.url !== externalLink)
                  .map((l, i) => (
                    <a
                      key={i}
                      className={styles.modalLink}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 {l.url.replace(/^https?:\/\//, '')}
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* ── Score rings top-right ── */}
          {scoreEntries.length > 0 && (
            <div className={styles.headerScorePanel}>
              <ScoreBurst scoreEntries={scoreEntries} totalScore={creator.recommendation_score} />
            </div>
          )}
        </div>

        {/* ── IG-style stats bar ── */}
        <div className={styles.modalIgStats}>
          <div className={styles.modalIgStat}>
            <span className={styles.modalIgStatVal}>
              {formatFollowers(creator.instagram_followers ?? undefined)}
            </span>
            <span className={styles.modalIgStatLbl}>IG Followers</span>
          </div>
          <div className={styles.modalIgStat}>
            <span className={styles.modalIgStatVal}>
              {formatFollowers(creator.tiktok_followers ?? undefined)}
            </span>
            <span className={styles.modalIgStatLbl}>TT Followers</span>
          </div>
          <div className={styles.modalIgStat}>
            <span className={styles.modalIgStatVal}>
              {creator.engagement_rate != null
                ? `${Number(creator.engagement_rate).toFixed(1)}%`
                : '—'}
            </span>
            <span className={styles.modalIgStatLbl}>Eng. Rate</span>
          </div>
          {creator.age && (
            <div className={styles.modalIgStat}>
              <span className={styles.modalIgStatVal}>{creator.age}</span>
              <span className={styles.modalIgStatLbl}>Age</span>
            </div>
          )}
        </div>

        {/* ── Info chips ── */}
        <div className={styles.modalChipsRow}>
          {creator.country && <span className={styles.modalChip}>📍 {creator.country}</span>}
          {(creator.languages?.length ?? 0) > 0 && (
            <span className={styles.modalChip}>🌐 {creator.languages!.join(', ')}</span>
          )}
          {(creator.niches?.length ?? 0) > 0 &&
            creator.niches!.map((n, i) => (
              <span key={i} className={styles.modalChip}>
                {n}
              </span>
            ))}
          {creator.gender && <span className={styles.modalChip}>{creator.gender}</span>}
          {creator.is_business && <span className={styles.modalChip}>🏢 Business</span>}
        </div>

        {/* ── Why this creator (AI selection reason) ── */}
        {creator.selection_reason && (
          <div className={styles.modalReasonSection}>
            <p className={styles.modalSectionLabel}>Why this creator</p>
            <p className={styles.modalSelectionReason}>{creator.selection_reason}</p>
          </div>
        )}

        {/* ── Contact info ── */}
        {(creator.email || creator.phone || creator.rate) && (
          <div className={styles.modalContactSection}>
            <p className={styles.modalSectionLabel}>Contact & Rate</p>
            <div className={styles.modalContactRow}>
              {creator.email && <span className={styles.modalContact}>✉️ {creator.email}</span>}
              {creator.phone && <span className={styles.modalContact}>📞 {creator.phone}</span>}
              {creator.rate && <span className={styles.modalContact}>💰 {creator.rate}</span>}
            </div>
          </div>
        )}

        {/* ── Posts grid ── */}
        {allPosts.length > 0 && (
          <div className={styles.modalPostsSection}>
            <div className={styles.postsTabRow}>
              <button
                className={`${styles.postsTab} ${activeTab === 'posts' ? styles.postsTabActive : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                ⊞ Posts ({allPosts.length})
              </button>
              {reels.length > 0 && (
                <button
                  className={`${styles.postsTab} ${activeTab === 'reels' ? styles.postsTabActive : ''}`}
                  onClick={() => setActiveTab('reels')}
                >
                  ▶ Reels ({reels.length})
                </button>
              )}
            </div>
            <div className={activeTab === 'reels' ? styles.reelsGrid : styles.postsGrid}>
              {displayedPosts.slice(0, activeTab === 'reels' ? 9 : 12).map((post) => (
                <PostCell key={post.id} post={post} isReel={activeTab === 'reels'} />
              ))}
            </div>
          </div>
        )}

        {/* ── Sticky accept / reject bar ── */}
        {onDecision && (
          <div className={styles.modalActionBar}>
            {decision === 'accepted' ? (
              <div className={styles.modalDecisionBadge} data-decision="accepted">
                ✓ Accepted
              </div>
            ) : decision === 'rejected' ? (
              <div className={styles.modalDecisionBadge} data-decision="rejected">
                ✕ Rejected
              </div>
            ) : (
              <>
                <button
                  className={`${styles.modalActionBtn} ${styles.modalActionAccept}`}
                  onClick={() => {
                    onDecision(creator.creator_id, 'accepted');
                    onClose();
                  }}
                  disabled={isPending}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Accept Creator
                </button>
                <button
                  className={`${styles.modalActionBtn} ${styles.modalActionReject}`}
                  onClick={() => {
                    onDecision(creator.creator_id, 'rejected');
                    onClose();
                  }}
                  disabled={isPending}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Reject
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────────
function RecommendationCard({
  creator,
  decision,
  onDecision,
  isPending = false,
  showScores = true,
  onSeeConversation,
}: {
  creator: RecommendationCreator;
  decision?: 'accepted' | 'rejected';
  onDecision?: (creatorId: string, decision: 'accepted' | 'rejected') => void;
  isPending?: boolean;
  showScores?: boolean;
  onSeeConversation?: (creatorId: string) => void;
}) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const color = avatarColor(creator.name);

  return (
    <>
      <div
        className={`${styles.recCard} ${decision === 'accepted' ? styles.recCardAccepted : decision === 'rejected' ? styles.recCardRejected : ''}`}
      >
        <div className={styles.cardTop}>
          <div className={styles.cardAvatar} style={{ '--c': color } as React.CSSProperties}>
            {creator.profile_picture && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxyUrl(creator.profile_picture)}
                alt={creator.name}
                className={styles.cardAvatarImg}
                onError={() => setImgError(true)}
              />
            ) : (
              getInitials(creator.name)
            )}
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
            {showScores && (
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
            )}
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
              {creator.engagement_rate != null
                ? `${Number(creator.engagement_rate).toFixed(1)}%`
                : '—'}
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

        {/* AI score rings — always visible */}
        {showScores && (
          <div className={styles.cardScoreRings}>
            {(() => {
              const sb = creator.score_breakdown;
              return (
                <>
                  <ScoreRing
                    label="Semantic"
                    value={sb.semantic ?? 0}
                    max={80}
                    size={46}
                    stroke={4}
                  />
                  <ScoreRing
                    label="Engagement"
                    value={sb.engagement}
                    max={15}
                    size={46}
                    stroke={4}
                  />
                  <ScoreRing
                    label="Completeness"
                    value={sb.completeness}
                    max={5}
                    size={46}
                    stroke={4}
                  />
                </>
              );
            })()}
          </div>
        )}

        {decision === 'accepted' && <div className={styles.acceptedBadge}>✓ Accepted</div>}
        {decision === 'rejected' && <div className={styles.rejectedBadge}>✕ Rejected</div>}

        <div className={styles.cardActions}>
          {onDecision && !decision && (
            <div className={styles.cardActionsRow}>
              <button
                className={`${styles.btn} ${styles.btnApprove}`}
                onClick={() => onDecision(creator.creator_id, 'accepted')}
                disabled={isPending}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Accept
              </button>
              <button
                className={`${styles.btn} ${styles.btnReject}`}
                onClick={() => onDecision(creator.creator_id, 'rejected')}
                disabled={isPending}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Reject
              </button>
            </div>
          )}
          <button
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnFullWidth}`}
            onClick={() => setModalOpen(true)}
          >
            View Profile
          </button>
          {onSeeConversation && (
            <button
              className={`${styles.btn} ${styles.btnConversation} ${styles.btnFullWidth}`}
              onClick={() => onSeeConversation(creator.creator_id)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              See Conversation
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <CreatorDetailModal
          creator={creator}
          onClose={() => setModalOpen(false)}
          onDecision={onDecision}
          decision={decision}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ── Recommendations section ───────────────────────────────────────────────────
// ── Campaign brief (sticky requirements bar) ─────────────────────────────────
type ExtractedRequirements = RecommendationsResponse['extracted_requirements'];

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function BriefField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.briefField}>
      <span className={styles.briefFieldLabel}>{label}</span>
      <span className={styles.briefFieldValue}>{children}</span>
    </div>
  );
}

function CampaignBrief({ req }: { req: ExtractedRequirements }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [notesExpanded, setNotesExpanded] = React.useState(false);

  const locationLabel =
    req.audience_country ||
    (req.locations && req.locations.length > 0 ? req.locations.map(titleCase).join(', ') : null);

  const audienceBits = [
    locationLabel,
    req.audience_age_range ? `${req.audience_age_range} yrs` : null,
    req.min_followers ? `${formatFollowers(req.min_followers)}+ followers` : null,
    req.min_engagement_rate > 0 ? `${req.min_engagement_rate}% min eng.` : null,
  ].filter(Boolean) as string[];

  const NOTES_PREVIEW = 160;
  const notes = req.additional_notes ?? '';
  const notesIsLong = notes.length > NOTES_PREVIEW;

  return (
    <div className={styles.brief}>
      {/* Header */}
      <div className={styles.briefHeader}>
        <span className={styles.briefTitle}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          Campaign Brief
        </span>
        <button className={styles.briefToggle} onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? 'Expand ▾' : 'Collapse ▴'}
        </button>
      </div>

      {/* Collapsed: single-line summary */}
      {collapsed ? (
        <div className={styles.briefSummary}>
          {titleCase(req.campaign_objective)} · {titleCase(req.preferred_tier)}
          {req.num_creators_needed ? ` · ${req.num_creators_needed} creators` : ''}
          {locationLabel ? ` · ${locationLabel}` : ''}
          {req.niches?.length ? ` · ${req.niches.join(', ')}` : ''}
        </div>
      ) : (
        <>
          {/* Core fields */}
          <div className={styles.briefGrid}>
            <BriefField label="Objective">{titleCase(req.campaign_objective)}</BriefField>
            <BriefField label="Preferred Tier">{titleCase(req.preferred_tier)}</BriefField>
            {req.num_creators_needed != null && (
              <BriefField label="Creators Needed">{req.num_creators_needed}</BriefField>
            )}
            {req.platforms?.length > 0 && (
              <BriefField label="Platforms">
                <span className={styles.briefChips}>
                  {req.platforms.map((p) => (
                    <span key={p} className={styles.briefChipSolid}>
                      {titleCase(p)}
                    </span>
                  ))}
                </span>
              </BriefField>
            )}
          </div>

          {/* Audience targeting */}
          {audienceBits.length > 0 && (
            <BriefField label="Audience">
              <span className={styles.briefChips}>
                {audienceBits.map((b) => (
                  <span key={b} className={styles.briefChip}>
                    {b}
                  </span>
                ))}
              </span>
            </BriefField>
          )}

          {/* Niches */}
          {req.niches?.length > 0 && (
            <BriefField label="Niches">
              <span className={styles.briefChips}>
                {req.niches.map((n) => (
                  <span key={n} className={styles.briefChipNiche}>
                    {n}
                  </span>
                ))}
              </span>
            </BriefField>
          )}

          {/* Brand style */}
          {req.brand_style?.length > 0 && (
            <BriefField label="Brand Style">
              <span className={styles.briefChips}>
                {req.brand_style.map((s) => (
                  <span key={s} className={styles.briefChipStyle}>
                    {s}
                  </span>
                ))}
              </span>
            </BriefField>
          )}

          {/* Constraints / flags */}
          <div className={styles.briefFlags}>
            {req.can_visit_location && (
              <span className={`${styles.briefFlag} ${styles.briefFlagYes}`}>
                ✓ Must visit location
              </span>
            )}
            {req.is_comedic && <span className={styles.briefFlag}>😄 Comedic tone</span>}
            {req.is_presentable && (
              <span className={styles.briefFlag}>✨ Presentable on-camera</span>
            )}
          </div>

          {/* Notes — truncated with read more */}
          {notes && (
            <div className={styles.briefNotes}>
              <span className={styles.briefFieldLabel}>Campaign Notes</span>
              <p className={styles.briefNotesText}>
                {notesExpanded || !notesIsLong
                  ? notes
                  : `${notes.slice(0, NOTES_PREVIEW).trimEnd()}… `}
                {notesIsLong && (
                  <button
                    className={styles.briefReadMore}
                    onClick={() => setNotesExpanded((e) => !e)}
                  >
                    {notesExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
        <div className={styles.briefSticky}>
          <CampaignBrief req={req} />
        </div>
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

// ── Client-approved section ───────────────────────────────────────────────────

function tierFromFollowers(followers: number | null | undefined): InfluencerTier {
  const n = followers ?? 0;
  if (n >= 1_000_000) return 'mega';
  if (n >= 500_000) return 'macro';
  if (n >= 100_000) return 'mid_tier';
  if (n >= 10_000) return 'micro';
  return 'nano';
}

// Adapt a client-approved creator into the RecommendationCreator shape so we can
// reuse the same card / profile modal. The client-approved endpoint carries no AI
// scores, so score fields are zeroed and hidden via the card's `showScores={false}`.
function clientApprovedToCreator(c: ClientApprovedCreator): RecommendationCreator {
  const p = c.profile;
  const niches = (p.niche ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  return {
    creator_id: p.creator_id,
    name: p.name,
    tier: tierFromFollowers(p.follower_count ?? p.instagram_followers),
    country: p.location ?? '',
    languages: null,
    niches: niches.length > 0 ? niches : null,
    instagram_followers: p.instagram_followers ?? null,
    tiktok_followers: p.tiktok_followers ?? null,
    max_followers: p.follower_count ?? null,
    engagement_rate: p.engagement_rate ?? p.instagram_engagement_rate ?? null,
    instagram_handle: p.instagram_handle ?? null,
    tiktok_handle: p.tiktok_handle ?? null,
    recommendation_score: 0,
    score_breakdown: { niche: 0, engagement: 0, completeness: 0, semantic: 0 },
    selection_reason: '',
    status: null,
    profile_picture: p.profile_image ?? null,
    bio: p.bio ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    rate: p.rate ?? null,
    gender: null,
    age: null,
    is_verified: p.is_verified ?? false,
    is_business: p.is_business ?? false,
    searchapi_data: p.searchapi_data,
  };
}

function ClientApprovedSection({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useClientApprovedCreators(leadId);

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.shimmer} ${styles.skeletonCard}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p>Could not load client-approved creators. Please try again.</p>
      </div>
    );
  }

  const creators = data?.creators ?? [];

  if (creators.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No creators have been approved by the client yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.recSection}>
      <div className={styles.recHeader}>
        <h3 className={styles.recTitle}>Client Approved Creators</h3>
        <span className={styles.recMeta}>
          {creators.length} approved{data?.brand_name ? ` · ${data.brand_name}` : ''}
        </span>
      </div>

      <div className={styles.creatorGrid}>
        {creators.map((c) => (
          <RecommendationCard
            key={c.assignment_id}
            creator={clientApprovedToCreator(c)}
            showScores={false}
            onSeeConversation={(creatorId) => {
              router.push(`/campaigns/inbox?lead=${leadId}&creator=${creatorId}&tab=influencer`);
            }}
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
export function InfluencerDiscovery({
  leadId,
  activeStage,
}: {
  leadId: string;
  activeStage?: CampaignLeadStage;
}) {
  // The "Client Approved" stage reuses the creator card UI but shows the
  // client-approved roster (no accept/reject — a "See Conversation" action instead).
  //
  // Both branches return a keyed component so that switching influencer sub-stages
  // (this component instance is shared across the whole `influencer` group in
  // StagePanel) cleanly unmounts one subtree and mounts the other, instead of
  // reconciling two structurally different trees in place. The in-place swap could
  // tear down a stateful child mid-commit (e.g. a playing <video> in a creator
  // modal) and crash with "Cannot read properties of null (reading 'removeChild')".
  if (activeStage === 'influencer_client_approved') {
    return <ClientApprovedView key="client-approved" leadId={leadId} />;
  }

  return <DiscoveryView key="discovery" leadId={leadId} />;
}

export function ClientApprovedView({
  leadId,
  title = 'Client Approved',
  subtitle = 'Creators approved by the client for this campaign',
  notice,
}: {
  leadId: string;
  title?: string;
  subtitle?: string;
  notice?: string;
}) {
  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>{title}</h2>
          <p className={styles.pageSubtitle}>{subtitle}</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.main}>
          {notice && (
            <div className={styles.conversationNotice}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{notice}</span>
            </div>
          )}
          <ClientApprovedSection leadId={leadId} />
        </div>
      </div>
    </div>
  );
}

function DiscoveryView({ leadId }: { leadId: string }) {
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
