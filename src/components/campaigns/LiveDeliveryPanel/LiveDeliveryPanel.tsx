'use client';

import { useMemo, useState } from 'react';
import styles from './LiveDeliveryPanel.module.css';
import { VideoPlayerModal } from '@/components/campaigns/VideoPlayerModal';
import { useDeliveryLiveLinks } from '@/hooks/useDeliveryLinks';
import { getThumbnailUrl, PLATFORM_LABELS } from '@/lib/contentLinks';
import type {
  ContentItem,
  DeliveryInfluencer,
  DeliveryLiveLink,
  DeliveryStatus,
} from '@/types/campaign.types';

interface Props {
  leadId: string;
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  accepted: 'Accepted',
  live: 'Live',
  complete: 'Complete',
};

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSubmitted(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Adapt a delivery link to the ContentItem shape the player understands.
function toContentItem(inf: DeliveryInfluencer, link: DeliveryLiveLink): ContentItem {
  return {
    id: link.url,
    influencerId: inf.creatorId,
    influencerName: inf.name,
    influencerAvatar: inf.avatar,
    platform: link.platform,
    contentUrl: link.url,
    caption: link.caption,
    status: 'client_approved',
    submittedAt: link.submittedAt,
  };
}

// ── Single post thumbnail ──────────────────────────────────────────────────────
function PostThumb({
  inf,
  link,
  index,
  onPlay,
}: {
  inf: DeliveryInfluencer;
  link: DeliveryLiveLink;
  index: number;
  onPlay: () => void;
}) {
  const poster = getThumbnailUrl(link.url, link.platform);
  const submitted = formatSubmitted(link.submittedAt);

  return (
    <button
      type="button"
      className={`${styles.thumb} ${styles[`thumb_${link.platform}`] ?? ''}`}
      onClick={onPlay}
      aria-label={`Play ${inf.name}'s ${PLATFORM_LABELS[link.platform]} post ${index + 1}`}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.poster} src={poster} alt="" loading="lazy" />
      )}
      <span className={styles.thumbOverlay} />
      <span className={styles.playCircle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 3 21 12 6 21 6 3" />
        </svg>
      </span>
      <span className={styles.platformTag}>{PLATFORM_LABELS[link.platform]}</span>
      {submitted && <span className={styles.thumbDate}>{submitted}</span>}
      {link.caption && <span className={styles.thumbCaption}>{link.caption}</span>}
    </button>
  );
}

// ── Influencer block ───────────────────────────────────────────────────────────
function InfluencerBlock({
  inf,
  onPlay,
}: {
  inf: DeliveryInfluencer;
  onPlay: (item: ContentItem) => void;
}) {
  const statusClass = styles[`status_${inf.deliveryStatus}`] ?? styles.status_live;

  return (
    <div className={styles.influencer}>
      <div className={styles.influencerHead}>
        <div className={styles.avatar}>
          {inf.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.avatarImg} src={inf.avatar} alt="" />
          ) : (
            initials(inf.name)
          )}
        </div>
        <div className={styles.influencerMeta}>
          <span className={styles.influencerName}>{inf.name}</span>
          {inf.handle && <span className={styles.influencerHandle}>{inf.handle}</span>}
        </div>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          <span className={styles.statusDot} />
          {STATUS_LABEL[inf.deliveryStatus] ?? inf.deliveryStatus}
        </span>
        <span className={styles.postCount}>
          {inf.liveLinks.length} {inf.liveLinks.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {inf.liveLinks.length ? (
        <div className={styles.postGrid}>
          {inf.liveLinks.map((link, i) => (
            <PostThumb
              key={`${link.url}-${i}`}
              inf={inf}
              link={link}
              index={i}
              onPlay={() => onPlay(toContentItem(inf, link))}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noPosts}>No posts submitted yet</div>
      )}
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────
export function LiveDeliveryPanel({ leadId }: Props) {
  const { data, isLoading, isError } = useDeliveryLiveLinks(leadId);
  const [active, setActive] = useState<ContentItem | null>(null);

  const totalPosts = useMemo(
    () => (data?.influencers ?? []).reduce((sum, inf) => sum + inf.liveLinks.length, 0),
    [data]
  );

  if (isLoading) {
    return (
      <>
        <div className={styles.header}>
          <div className={styles.shimmer} style={{ height: 24, width: 180 }} />
        </div>
        <div className={styles.body}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.influencer}>
              <div className={styles.shimmer} style={{ height: 44, width: '60%' }} />
              <div className={styles.postGrid}>
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className={styles.shimmer}
                    style={{ aspectRatio: '9 / 16', height: 200, borderRadius: 'var(--radius-lg)' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className={styles.header}>
          <h2 className={styles.title}>Live Delivery</h2>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Couldn’t load live links</div>
          <div className={styles.emptyText}>Please refresh and try again.</div>
        </div>
      </>
    );
  }

  const influencers = data?.influencers ?? [];
  const hasContent = influencers.length > 0;

  return (
    <>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Live Delivery</h2>
          <p className={styles.subtitle}>Posts the creators have published for this campaign</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data?.liveCount ?? 0}</span>
            <span className={styles.statLabel}>Live</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{data?.acceptedCount ?? 0}</span>
            <span className={styles.statLabel}>Accepted</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalPosts}</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          {data?.campaignComplete && (
            <span className={styles.completeBadge}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Campaign Complete
            </span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {hasContent ? (
          influencers.map((inf) => (
            <InfluencerBlock key={inf.creatorId} inf={inf} onPlay={setActive} />
          ))
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div className={styles.emptyTitle}>No live posts yet</div>
            <div className={styles.emptyText}>
              Once creators publish their content and submit the links, their Instagram and TikTok
              posts will appear here.
            </div>
          </div>
        )}
      </div>

      {active && <VideoPlayerModal item={active} onClose={() => setActive(null)} />}
    </>
  );
}
