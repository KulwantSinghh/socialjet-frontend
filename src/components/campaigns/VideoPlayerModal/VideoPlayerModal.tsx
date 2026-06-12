'use client';

import styles from './VideoPlayerModal.module.css';
import { getDirectVideoUrl, getEmbedUrl, PLATFORM_LABELS } from '@/lib/contentLinks';
import type { ContentItem } from '@/types/campaign.types';

interface VideoPlayerModalProps {
  item: ContentItem;
  onClose: () => void;
}

export const VideoPlayerModal = ({ item, onClose }: VideoPlayerModalProps) => {
  const embedUrl = getEmbedUrl(item.contentUrl, item.platform);
  const directUrl = embedUrl ? null : getDirectVideoUrl(item.contentUrl, item.platform);
  // Reels/TikToks are vertical; YouTube, Drive previews and raw files default
  // to a wide frame.
  const isLandscape = item.platform !== 'instagram' && item.platform !== 'tiktok';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isLandscape ? styles.landscape : styles.portrait}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${PLATFORM_LABELS[item.platform]} video preview`}
      >
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            {item.influencerName && <span className={styles.creator}>{item.influencerName}</span>}
            <span className={styles.platform}>{PLATFORM_LABELS[item.platform]}</span>
          </div>
          <a className={styles.openLink} href={item.contentUrl} target="_blank" rel="noreferrer">
            {item.platform === 'other'
              ? 'Open original link'
              : `Open on ${PLATFORM_LABELS[item.platform]}`}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6M10 14 21 3" />
            </svg>
          </a>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close video">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          {embedUrl ? (
            <iframe
              className={styles.frame}
              src={embedUrl}
              title={`${PLATFORM_LABELS[item.platform]} video`}
              allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
              allowFullScreen
            />
          ) : directUrl ? (
            <video className={styles.video} src={directUrl} controls autoPlay playsInline />
          ) : (
            <div className={styles.fallback}>
              <p>This link can’t be previewed in the CRM.</p>
              <a href={item.contentUrl} target="_blank" rel="noreferrer">
                {item.platform === 'other'
                  ? 'Open the original link'
                  : `Watch on ${PLATFORM_LABELS[item.platform]}`}
              </a>
            </div>
          )}
        </div>

        {item.caption && <p className={styles.caption}>{item.caption}</p>}
      </div>
    </div>
  );
};
