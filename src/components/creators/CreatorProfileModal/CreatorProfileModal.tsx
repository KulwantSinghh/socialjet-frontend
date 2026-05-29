'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './CreatorProfileModal.module.css';
import { useCreatorProfile } from '@/hooks/useCampaignLeads';
import type { IGPost, IGData } from '@/types/campaign.types';

/* ── image proxy ──────────────────────────────────────── */

function proxyImg(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

/* ── helpers ─────────────────────────────────────────── */

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function engagementRate(followers: number, posts: IGPost[] | undefined): string {
  if (!posts?.length || !followers) return '0%';
  const avgLikes = posts.reduce((s, p) => s + p.likes, 0) / posts.length;
  const avgComments = posts.reduce((s, p) => s + p.comments, 0) / posts.length;
  return (((avgLikes + avgComments) / followers) * 100).toFixed(2) + '%';
}

function avgViews(posts: IGPost[] | undefined): string {
  if (!posts?.length) return '—';
  const reels = posts.filter((p) => p.views);
  if (!reels.length) return '—';
  return fmtCount(Math.round(reels.reduce((s, p) => s + (p.views ?? 0), 0) / reels.length));
}

function avgLikes(posts: IGPost[] | undefined): string {
  if (!posts?.length) return '—';
  return fmtCount(Math.round(posts.reduce((s, p) => s + p.likes, 0) / posts.length));
}

/* ── icons ───────────────────────────────────────────── */

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const CarouselIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <rect x="2" y="4" width="14" height="16" rx="2" />
    <path d="M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ReelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MusicIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronLeft = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TTIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z" />
  </svg>
);

/* ── Post Lightbox ───────────────────────────────────── */

function PostLightbox({
  post,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isDark,
}: {
  post: IGPost;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isDark: boolean;
}) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [prevPostId, setPrevPostId] = useState(post.id);
  if (prevPostId !== post.id) {
    setPrevPostId(post.id);
    setCarouselIdx(0);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const items = post.carousel_items ?? [];
  const currentItem = items[carouselIdx];
  const mediaUrl = currentItem?.link ?? post.link;
  const isVideo = currentItem ? currentItem.type === 'video' : post.type === 'reel';

  return (
    <div
      className={`${styles.lightboxBackdrop} ${isDark ? styles.lightboxDark : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.lightbox} ${isDark ? styles.lightboxPanelDark : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* prev/next between posts */}
        {hasPrev && (
          <button className={`${styles.lightboxNav} ${styles.lightboxNavLeft}`} onClick={onPrev}>
            <ChevronLeft />
          </button>
        )}
        {hasNext && (
          <button className={`${styles.lightboxNav} ${styles.lightboxNavRight}`} onClick={onNext}>
            <ChevronRight />
          </button>
        )}

        {/* media panel */}
        <div className={`${styles.lightboxMedia} ${isDark ? styles.lightboxMediaDark : ''}`}>
          {isVideo ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              className={styles.lightboxVideo}
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyImg(mediaUrl) ?? mediaUrl}
              alt={post.caption ?? ''}
              className={styles.lightboxImage}
            />
          )}

          {/* carousel nav inside media */}
          {items.length > 1 && (
            <>
              {carouselIdx > 0 && (
                <button
                  className={`${styles.carouselBtn} ${styles.carouselBtnLeft}`}
                  onClick={() => setCarouselIdx((i) => i - 1)}
                >
                  <ChevronLeft />
                </button>
              )}
              {carouselIdx < items.length - 1 && (
                <button
                  className={`${styles.carouselBtn} ${styles.carouselBtnRight}`}
                  onClick={() => setCarouselIdx((i) => i + 1)}
                >
                  <ChevronRight />
                </button>
              )}
              <div className={styles.carouselDots}>
                {items.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.carouselDot} ${i === carouselIdx ? styles.carouselDotActive : ''}`}
                    onClick={() => setCarouselIdx(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* info panel */}
        <div className={`${styles.lightboxInfo} ${isDark ? styles.lightboxInfoDark : ''}`}>
          <button className={styles.lightboxClose} onClick={onClose}>
            <CloseIcon />
          </button>

          <div className={styles.lightboxStats}>
            {post.likes !== undefined && (
              <span className={styles.lightboxStat}>
                <HeartIcon /> {fmtCount(post.likes)}
              </span>
            )}
            {post.comments !== undefined && (
              <span className={styles.lightboxStat}>
                <CommentIcon /> {fmtCount(post.comments)}
              </span>
            )}
            {post.views !== undefined && (
              <span className={styles.lightboxStat}>
                <EyeIcon /> {fmtCount(post.views)}
              </span>
            )}
          </div>

          {post.caption && (
            <p className={`${styles.lightboxCaption} ${isDark ? styles.lightboxCaptionDark : ''}`}>
              {post.caption}
            </p>
          )}

          {post.location && (
            <div className={`${styles.lightboxMeta} ${isDark ? styles.lightboxMetaDark : ''}`}>
              <PinIcon /> {post.location.name}
            </div>
          )}

          {post.music && (
            <div className={`${styles.lightboxMeta} ${isDark ? styles.lightboxMetaDark : ''}`}>
              <MusicIcon /> {post.music.song_name}
              {!post.music.uses_original_audio && ` — ${post.music.artist_name}`}
            </div>
          )}

          {post.tagged_users && post.tagged_users.length > 0 && (
            <div className={styles.lightboxTagged}>
              <span
                className={`${styles.lightboxMetaLabel} ${isDark ? styles.lightboxMetaLabelDark : ''}`}
              >
                Tagged
              </span>
              <div className={styles.taggedChips}>
                {post.tagged_users.map((u) => (
                  <span
                    key={u.username}
                    className={`${styles.taggedChip} ${isDark ? styles.taggedChipDark : ''}`}
                  >
                    @{u.username}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.coauthors && post.coauthors.length > 0 && (
            <div className={styles.lightboxTagged}>
              <span
                className={`${styles.lightboxMetaLabel} ${isDark ? styles.lightboxMetaLabelDark : ''}`}
              >
                With
              </span>
              <div className={styles.taggedChips}>
                {post.coauthors.map((u) => (
                  <span
                    key={u.username}
                    className={`${styles.taggedChip} ${isDark ? styles.taggedChipDark : ''}`}
                  >
                    @{u.username}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.lightboxFooter}>
            <span className={`${styles.lightboxDate} ${isDark ? styles.lightboxDateDark : ''}`}>
              {fmtDate(post.iso_date)}
            </span>
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className={styles.lightboxPermalink}
            >
              <LinkIcon /> View on {post.type === 'reel' ? 'Instagram' : 'Instagram'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Posts Grid ──────────────────────────────────────── */

type ContentTab = 'grid' | 'reels' | 'top';

function PostsGrid({ data, isDark }: { data: IGData; isDark: boolean }) {
  const [tab, setTab] = useState<ContentTab>('grid');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const posts = data.posts ?? [];

  const filteredPosts = (() => {
    if (tab === 'reels') return posts.filter((p) => p.type === 'reel');
    if (tab === 'top')
      return [...posts].sort((a, b) => (b.views ?? b.likes) - (a.views ?? a.likes)).slice(0, 9);
    return posts;
  })();

  const handleClose = useCallback(() => setActiveIdx(null), []);
  const handlePrev = useCallback(() => setActiveIdx((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const handleNext = useCallback(
    () => setActiveIdx((i) => (i !== null && i < filteredPosts.length - 1 ? i + 1 : i)),
    [filteredPosts.length]
  );

  return (
    <div className={styles.gridSection}>
      {/* content tabs */}
      <div className={`${styles.contentTabs} ${isDark ? styles.contentTabsDark : ''}`}>
        <button
          className={`${styles.contentTab} ${tab === 'grid' ? (isDark ? styles.contentTabActiveDark : styles.contentTabActive) : ''} ${isDark ? styles.contentTabDark : ''}`}
          onClick={() => setTab('grid')}
        >
          <GridIcon /> Posts
        </button>
        <button
          className={`${styles.contentTab} ${tab === 'reels' ? (isDark ? styles.contentTabActiveDark : styles.contentTabActive) : ''} ${isDark ? styles.contentTabDark : ''}`}
          onClick={() => setTab('reels')}
        >
          <ReelIcon /> Reels
        </button>
        <button
          className={`${styles.contentTab} ${tab === 'top' ? (isDark ? styles.contentTabActiveDark : styles.contentTabActive) : ''} ${isDark ? styles.contentTabDark : ''}`}
          onClick={() => setTab('top')}
        >
          <StarIcon /> Top Posts
        </button>
      </div>

      {/* grid */}
      <div className={styles.postsGrid}>
        {filteredPosts.map((post, idx) => (
          <button key={post.id} className={styles.postCell} onClick={() => setActiveIdx(idx)}>
            <PostThumbnail post={post} idx={idx} />
            <div className={styles.postOverlay}>
              {post.type === 'reel' && (
                <span className={styles.postTypeIcon}>
                  <PlayIcon />
                </span>
              )}
              {post.type === 'carousel' && (
                <span className={styles.postTypeIconTop}>
                  <CarouselIcon />
                </span>
              )}
              <div className={styles.postOverlayStats}>
                {post.views !== undefined && (
                  <span className={styles.postOverlayStat}>
                    <EyeIcon /> {fmtCount(post.views)}
                  </span>
                )}
                <span className={styles.postOverlayStat}>
                  <HeartIcon /> {fmtCount(post.likes)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeIdx !== null && filteredPosts[activeIdx] && (
        <PostLightbox
          post={filteredPosts[activeIdx]}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={activeIdx > 0}
          hasNext={activeIdx < filteredPosts.length - 1}
          isDark={isDark}
        />
      )}
    </div>
  );
}

/* ── Avatar with initials fallback ───────────────────── */

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

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function AvatarImage({ src, name, isDark }: { src: string; name: string; isDark: boolean }) {
  const proxied = proxyImg(src);
  const [failed, setFailed] = useState(!proxied);
  const ringClass = isDark ? styles.ttAvatarRing : styles.igAvatarRing;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth === 0) setFailed(true);
  };

  return (
    <div className={ringClass}>
      {!failed && proxied ? (
        <img // eslint-disable-line @next/next/no-img-element
          src={proxied}
          alt={name}
          className={styles.profileAvatar}
          onError={() => setFailed(true)}
          onLoad={handleLoad}
        />
      ) : (
        <div className={styles.profileAvatarFallback} style={{ background: getAvatarColor(name) }}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

/* ── Post thumbnail with gradient fallback ───────────── */

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #fd7043 0%, #ff8a65 100%)',
];

function PostThumbnail({ post, idx }: { post: IGPost; idx: number }) {
  const proxied = proxyImg(post.thumbnail);
  const [failed, setFailed] = useState(!proxied);
  const gradient = THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length];

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth === 0) setFailed(true);
  };

  if (failed || !proxied) {
    return (
      <div className={styles.postThumbFallback} style={{ background: gradient }}>
        {post.type === 'reel' && (
          <span className={styles.thumbFallbackIcon}>
            <PlayIcon />
          </span>
        )}
      </div>
    );
  }

  return (
    <img // eslint-disable-line @next/next/no-img-element
      src={proxied}
      alt=""
      className={styles.postThumb}
      loading="lazy"
      onError={() => setFailed(true)}
      onLoad={handleLoad}
    />
  );
}

/* ── Platform Panel (profile header + grid) ──────────── */

function PlatformPanel({ data, isDark }: { data: IGData; isDark: boolean }) {
  const profile = data.profile!;
  const posts = data.posts ?? [];

  if (!profile) {
    return (
      <div style={{ padding: '2rem', color: '#888', textAlign: 'center' }}>
        Profile data unavailable.
      </div>
    );
  }

  return (
    <div className={`${styles.platformPanel} ${isDark ? styles.platformPanelDark : ''}`}>
      {/* profile header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <AvatarImage
            src={profile.avatar_hd ?? profile.avatar}
            name={profile.name}
            isDark={isDark}
          />
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileNameRow}>
            <h2 className={`${styles.profileUsername} ${isDark ? styles.profileUsernameDark : ''}`}>
              {profile.username}
            </h2>
            {profile.is_business && (
              <span className={`${styles.businessBadge} ${isDark ? styles.businessBadgeDark : ''}`}>
                Business
              </span>
            )}
            {profile.is_private && (
              <span className={`${styles.businessBadge} ${isDark ? styles.businessBadgeDark : ''}`}>
                Private
              </span>
            )}
          </div>

          {/* stats row — real IG style: number bold, label normal, no dividers */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${isDark ? styles.statValueDark : ''}`}>
                {fmtCount(profile.posts)}
              </span>
              <span className={`${styles.statLabel} ${isDark ? styles.statLabelDark : ''}`}>
                posts
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${isDark ? styles.statValueDark : ''}`}>
                {fmtCount(profile.followers)}
              </span>
              <span className={`${styles.statLabel} ${isDark ? styles.statLabelDark : ''}`}>
                followers
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${isDark ? styles.statValueDark : ''}`}>
                {fmtCount(profile.following)}
              </span>
              <span className={`${styles.statLabel} ${isDark ? styles.statLabelDark : ''}`}>
                following
              </span>
            </div>
            {profile.hearts !== undefined && (
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${isDark ? styles.statValueDark : ''}`}>
                  {fmtCount(profile.hearts)}
                </span>
                <span className={`${styles.statLabel} ${isDark ? styles.statLabelDark : ''}`}>
                  likes
                </span>
              </div>
            )}
          </div>

          {/* display name */}
          <div className={`${styles.profileName} ${isDark ? styles.profileNameDark : ''}`}>
            {profile.name}
          </div>

          {/* bio */}
          {profile.bio && (
            <p className={`${styles.profileBio} ${isDark ? styles.profileBioDark : ''}`}>
              {profile.bio}
            </p>
          )}

          {/* pronouns */}
          {profile.pronouns && profile.pronouns.length > 0 && (
            <span className={`${styles.pronouns} ${isDark ? styles.pronounsDark : ''}`}>
              {profile.pronouns.join('/')}
            </span>
          )}

          {/* external link */}
          {profile.external_link && (
            <a
              href={profile.external_link}
              target="_blank"
              rel="noreferrer"
              className={`${styles.externalLink} ${isDark ? styles.externalLinkDark : ''}`}
            >
              <LinkIcon /> {profile.external_link.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* analytics pills */}
      <div className={`${styles.analyticsRow} ${isDark ? styles.analyticsRowDark : ''}`}>
        <div className={`${styles.analyticsPill} ${isDark ? styles.analyticsPillDark : ''}`}>
          <span className={`${styles.analyticsValue} ${isDark ? styles.analyticsValueDark : ''}`}>
            {avgViews(posts)}
          </span>
          <span className={`${styles.analyticsLabel} ${isDark ? styles.analyticsLabelDark : ''}`}>
            Avg Views
          </span>
        </div>
        <div className={`${styles.analyticsPill} ${isDark ? styles.analyticsPillDark : ''}`}>
          <span className={`${styles.analyticsValue} ${isDark ? styles.analyticsValueDark : ''}`}>
            {avgLikes(posts)}
          </span>
          <span className={`${styles.analyticsLabel} ${isDark ? styles.analyticsLabelDark : ''}`}>
            Avg Likes
          </span>
        </div>
        <div className={`${styles.analyticsPill} ${isDark ? styles.analyticsPillDark : ''}`}>
          <span className={`${styles.analyticsValue} ${isDark ? styles.analyticsValueDark : ''}`}>
            {engagementRate(profile.followers, posts)}
          </span>
          <span className={`${styles.analyticsLabel} ${isDark ? styles.analyticsLabelDark : ''}`}>
            Eng. Rate
          </span>
        </div>
        <div className={`${styles.analyticsPill} ${isDark ? styles.analyticsPillDark : ''}`}>
          <span className={`${styles.analyticsValue} ${isDark ? styles.analyticsValueDark : ''}`}>
            {(posts ?? []).filter((p) => p.type === 'reel').length}
          </span>
          <span className={`${styles.analyticsLabel} ${isDark ? styles.analyticsLabelDark : ''}`}>
            Reels
          </span>
        </div>
      </div>

      {/* posts grid */}
      {posts.length > 0 ? (
        <PostsGrid data={data} isDark={isDark} />
      ) : (
        <div className={`${styles.emptyState} ${isDark ? styles.emptyStateDark : ''}`}>
          <p>No posts available.</p>
        </div>
      )}
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────── */

type Platform = 'instagram' | 'tiktok';

export function CreatorProfileModal({
  creatorId,
  onClose,
}: {
  creatorId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useCreatorProfile(creatorId);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const gridRef = useRef<HTMLDivElement>(null);

  const igData = data?.searchapi_data?.instagram?.profile
    ? data.searchapi_data.instagram
    : undefined;
  const ttData = data?.searchapi_data?.tiktok?.profile ? data.searchapi_data.tiktok : undefined;
  const hasBoth = !!igData && !!ttData;

  const [prevIgData, setPrevIgData] = useState(igData);
  const [prevTtData, setPrevTtData] = useState(ttData);
  if (prevIgData !== igData || prevTtData !== ttData) {
    setPrevIgData(igData);
    setPrevTtData(ttData);
    if (igData) setPlatform('instagram');
    else if (ttData) setPlatform('tiktok');
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isDark = platform === 'tiktok';
  const activePlatformData = platform === 'instagram' ? igData : ttData;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={`${styles.modal} ${isDark ? styles.modalDark : ''}`}>
        {/* top bar */}
        <div className={`${styles.topBar} ${isDark ? styles.topBarDark : ''}`}>
          <div className={styles.topBarLeft}>
            {hasBoth && (
              <div className={`${styles.platformTabs} ${isDark ? styles.platformTabsDark : ''}`}>
                <button
                  className={`${styles.platformTab} ${platform === 'instagram' ? styles.platformTabActiveIG : ''} ${isDark ? styles.platformTabDark : ''}`}
                  onClick={() => setPlatform('instagram')}
                >
                  <IGIcon /> Instagram
                </button>
                <button
                  className={`${styles.platformTab} ${platform === 'tiktok' ? styles.platformTabActiveTT : ''} ${isDark ? styles.platformTabDark : ''}`}
                  onClick={() => setPlatform('tiktok')}
                >
                  <TTIcon /> TikTok
                </button>
              </div>
            )}
            {!hasBoth && igData && (
              <div className={styles.singlePlatformBadge}>
                <IGIcon /> Instagram
              </div>
            )}
            {!hasBoth && ttData && (
              <div className={`${styles.singlePlatformBadge} ${styles.singlePlatformBadgeTT}`}>
                <TTIcon /> TikTok
              </div>
            )}
          </div>
          <button
            className={`${styles.closeBtn} ${isDark ? styles.closeBtnDark : ''}`}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        {/* body */}
        <div className={styles.body} ref={gridRef}>
          {isLoading ? (
            <div className={`${styles.loadingState} ${isDark ? styles.loadingStateDark : ''}`}>
              <div className={styles.skeletonHeader}>
                <div className={`${styles.shimmer} ${styles.skeletonAvatar}`} />
                <div className={styles.skeletonLines}>
                  {[180, 120, 200, 100].map((w, i) => (
                    <div
                      key={i}
                      className={`${styles.shimmer} ${styles.skeletonLine}`}
                      style={{ width: w }}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`${styles.shimmer} ${styles.skeletonCell}`} />
                ))}
              </div>
            </div>
          ) : !activePlatformData ? (
            <div className={`${styles.emptyState} ${isDark ? styles.emptyStateDark : ''}`}>
              <p>No social media data available for this creator.</p>
            </div>
          ) : (
            <PlatformPanel data={activePlatformData} isDark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
}
