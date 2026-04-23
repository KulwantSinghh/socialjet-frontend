'use client';

import { useState } from 'react';
import styles from './CampaignInfluencersPage.module.css';
import { useAllInfluencers } from '@/hooks/useCampaignLeads';

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function SkeletonCard() {
  return (
    <div className={styles.cardSkeleton}>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div
          className={styles.shimmer}
          style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className={styles.shimmer} style={{ height: 14, width: '55%' }} />
          <div className={styles.shimmer} style={{ height: 11, width: '35%' }} />
        </div>
      </div>
      <div
        className={styles.shimmer}
        style={{ height: 64, width: '100%', borderRadius: 'var(--radius-lg)' }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <div className={styles.shimmer} style={{ height: 20, width: 56, borderRadius: 999 }} />
        <div className={styles.shimmer} style={{ height: 20, width: 48, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function CampaignInfluencersPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');

  const { data: influencers, isLoading } = useAllInfluencers({
    search: search || undefined,
    platform: platform || undefined,
  });

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

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
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
          ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)
          : (influencers ?? []).map((inf) => (
              <div key={inf.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{getInitials(inf.name)}</div>
                  <div className={styles.cardInfo}>
                    <div className={styles.influencerName}>{inf.name}</div>
                    <div className={styles.influencerHandle}>@{inf.handle}</div>
                  </div>
                  <span
                    className={`${styles.platformBadge} ${styles[`platform${inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1)}` as keyof typeof styles]}`}
                  >
                    {inf.platform}
                  </span>
                </div>

                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatFollowers(inf.followers)}</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{inf.engagementRate.toFixed(1)}%</span>
                    <span className={styles.statLabel}>Eng. Rate</span>
                  </div>
                  {inf.avgViews && (
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{formatFollowers(inf.avgViews)}</span>
                      <span className={styles.statLabel}>Avg Views</span>
                    </div>
                  )}
                </div>

                {inf.niche.length > 0 && (
                  <div className={styles.niches}>
                    {inf.niche.slice(0, 3).map((n) => (
                      <span key={n} className={styles.niche}>
                        {n}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.cardActions}>
                  <button className={`${styles.btn} ${styles.btnSecondary}`}>View Profile</button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>Add to Campaign</button>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && !influencers?.length && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-16)',
          }}
        >
          No influencers found
        </div>
      )}
    </div>
  );
}
