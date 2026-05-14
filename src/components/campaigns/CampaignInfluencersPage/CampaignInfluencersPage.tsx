'use client';

import React, { useState } from 'react';
import styles from './CampaignInfluencersPage.module.css';
import { useAllInfluencers } from '@/hooks/useCampaignLeads';
import { CreatorProfileModal } from '@/components/creators/CreatorProfileModal';
import type { Influencer } from '@/types/campaign.types';

const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
];

function getAvatarColor(name: string | undefined): string {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function parseNiches(raw: string[] | string | undefined): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string' && raw)
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function isSkip(s: string | undefined): boolean {
  return !s || ['skip', 'nil', 'no', 'n/a', '-'].includes(s.toLowerCase().trim());
}

/* ── Icons ──────────────────────────────────────────── */
const IGIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TTIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z" />
  </svg>
);

const TGIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const PinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LangIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const _HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const _TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.3-7.3a1 1 0 0 0 0-1.41L12 2z" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/* ── Skeleton card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.skeletonTop}>
        <div className={`${styles.shimmer} ${styles.skeletonAvatar}`} />
        <div className={styles.skeletonInfo}>
          <div className={`${styles.shimmer} ${styles.skeletonLine}`} style={{ width: '60%' }} />
          <div
            className={`${styles.shimmer} ${styles.skeletonLine}`}
            style={{ width: '40%', height: 10 }}
          />
        </div>
      </div>
      <div className={styles.skeletonTags}>
        {[64, 52, 80].map((w, i) => (
          <div key={i} className={`${styles.shimmer} ${styles.skeletonTag}`} style={{ width: w }} />
        ))}
      </div>
      <div
        className={`${styles.shimmer} ${styles.skeletonLine}`}
        style={{ height: 32, borderRadius: 8 }}
      />
    </div>
  );
}

/* ── Influencer card ─────────────────────────────────── */
function InfluencerCard({
  inf,
  onViewProfile,
}: {
  inf: Influencer;
  onViewProfile: (id: string) => void;
}) {
  const color = getAvatarColor(inf.name);
  const niches = parseNiches(inf.niche);

  const showIG = inf.instagramHandle && !isSkip(inf.instagramHandle);
  const showTT = inf.tiktokHandle && !isSkip(inf.tiktokHandle);
  const showTG = inf.telegramHandle && !isSkip(inf.telegramHandle);

  return (
    <div className={styles.card}>
      {/* ── Header ── */}
      <div className={styles.cardHeader}>
        <div className={styles.avatar} style={{ '--avatar-color': color } as React.CSSProperties}>
          {getInitials(inf.name)}
        </div>
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{inf.name || '—'}</span>
            {inf.gender && (
              <span
                className={`${styles.badge} ${inf.gender === 'Male' ? styles.badgeMale : styles.badgeFemale}`}
              >
                {inf.gender}
              </span>
            )}
          </div>
          <div className={styles.metaRow}>
            {inf.age && <span className={styles.metaChip}>{inf.age} yrs</span>}
            {inf.location && (
              <span className={styles.metaChip}>
                <PinIcon /> {inf.location}
              </span>
            )}
          </div>
        </div>
        {inf.creatorStatus && (
          <span
            className={`${styles.statusDot} ${styles[`status_${inf.creatorStatus}`]}`}
            title={inf.creatorStatus}
          />
        )}
      </div>

      {/* ── Platform handles ── */}
      {(showIG || showTT || showTG) && (
        <div className={styles.handles}>
          {showIG && (
            <a
              className={`${styles.handleChip} ${styles.handleIG}`}
              href={`https://instagram.com/${inf.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
            >
              <IGIcon /> @{inf.instagramHandle}
            </a>
          )}
          {showTT && (
            <a
              className={`${styles.handleChip} ${styles.handleTT}`}
              href={`https://tiktok.com/@${inf.tiktokHandle}`}
              target="_blank"
              rel="noreferrer"
            >
              <TTIcon /> @{inf.tiktokHandle}
            </a>
          )}
          {showTG && (
            <span className={`${styles.handleChip} ${styles.handleTG}`}>
              <TGIcon /> {inf.telegramHandle}
            </span>
          )}
        </div>
      )}

      {/* ── Niches ── */}
      {niches.length > 0 && (
        <div className={styles.niches}>
          {niches.slice(0, 4).map((n, i) => (
            <span key={i} className={styles.niche}>
              {n}
            </span>
          ))}
          {niches.length > 4 && <span className={styles.nicheMore}>+{niches.length - 4}</span>}
        </div>
      )}

      {/* ── Info grid ── */}
      <div className={styles.infoGrid}>
        {inf.email && (
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <MailIcon />
            </span>
            <span className={styles.infoText} title={inf.email}>
              {inf.email}
            </span>
          </div>
        )}
        {inf.phone && (
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <PhoneIcon />
            </span>
            <span className={styles.infoText}>{inf.phone}</span>
          </div>
        )}
        {inf.languages && (
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <LangIcon />
            </span>
            <span className={styles.infoText}>{inf.languages}</span>
          </div>
        )}
        {inf.otherPlatforms && !isSkip(inf.otherPlatforms) && (
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <LinkIcon />
            </span>
            <span className={styles.infoText}>{inf.otherPlatforms}</span>
          </div>
        )}
      </div>

      {/* ── Rate ── */}
      {inf.rate && (
        <div className={styles.rateRow}>
          <span className={styles.rateLabel}>Rate</span>
          <span className={styles.rateValue}>{inf.rate}</span>
        </div>
      )}

      {/* ── Actions ── */}
      <div className={styles.cardActions}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => onViewProfile(inf.id)}
        >
          View Profile
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`}>Add to Campaign</button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export function CampaignInfluencersPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [activeCreatorId, setActiveCreatorId] = useState<string | null>(null);

  const { data: influencers, isLoading } = useAllInfluencers({
    search: search || undefined,
    platform: platform || undefined,
  });

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Influencers</h1>
          <p className={styles.subtitle}>Browse and assign influencers to your campaigns</p>
        </div>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className={styles.searchInput}
              placeholder="Search influencers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} />)
          : (influencers ?? []).map((inf) => (
              <InfluencerCard key={inf.id} inf={inf} onViewProfile={setActiveCreatorId} />
            ))}
      </div>

      {!isLoading && !influencers?.length && (
        <div className={styles.empty}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p>No influencers found</p>
        </div>
      )}

      {activeCreatorId && (
        <CreatorProfileModal creatorId={activeCreatorId} onClose={() => setActiveCreatorId(null)} />
      )}
    </div>
  );
}
