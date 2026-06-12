'use client';

import { useState } from 'react';
import styles from './ContentLinkCard.module.css';
import { VideoPlayerModal } from '@/components/campaigns/VideoPlayerModal';
import { PLATFORM_LABELS } from '@/lib/contentLinks';
import type { ContentItem, ContentStatus } from '@/types/campaign.types';

interface ContentLinkCardProps {
  item: ContentItem;
  /** Show the creator's name on the card (lead-level views). */
  showCreator?: boolean;
  /** Render Approve / Reject controls for reviewable statuses. */
  canReview?: boolean;
  onReview?: (status: 'cm_approved' | 'cm_rejected', note?: string) => void;
  reviewPending?: boolean;
  /** Extra actions below the card body (e.g. Assign Publish Date). */
  footer?: React.ReactNode;
}

const STATUS_CLASS: Record<ContentStatus, string> = {
  pending: 'statusPending',
  submitted: 'statusSubmitted',
  cm_approved: 'statusApproved',
  cm_rejected: 'statusRejected',
  client_approved: 'statusApproved',
  client_rejected: 'statusRejected',
  scheduled: 'statusScheduled',
};

export const ContentLinkCard = ({
  item,
  showCreator = false,
  canReview = false,
  onReview,
  reviewPending = false,
  footer,
}: ContentLinkCardProps) => {
  const [playing, setPlaying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  const statusClass = styles[STATUS_CLASS[item.status]] ?? styles.statusPending;
  const reviewable = canReview && (item.status === 'pending' || item.status === 'submitted');

  function confirmReject() {
    onReview?.('cm_rejected', note.trim() || undefined);
    setRejecting(false);
    setNote('');
  }

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={`${styles.thumb} ${styles[`thumb_${item.platform}`] ?? ''}`}
        onClick={() => setPlaying(true)}
        aria-label="Play video"
      >
        <span className={styles.playCircle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 3 21 12 6 21 6 3" />
          </svg>
        </span>
        <span className={styles.platformTag}>{PLATFORM_LABELS[item.platform]}</span>
      </button>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          {showCreator && <span className={styles.creator}>{item.influencerName}</span>}
          <span className={`${styles.status} ${statusClass}`}>
            {item.status.replace(/_/g, ' ')}
          </span>
        </div>
        {item.caption && <p className={styles.caption}>{item.caption}</p>}
        <a className={styles.link} href={item.contentUrl} target="_blank" rel="noreferrer">
          {item.contentUrl}
        </a>
        {item.status === 'cm_rejected' && item.cmNote && (
          <p className={styles.rejectNote}>Rejected: {item.cmNote}</p>
        )}
      </div>

      {reviewable && !rejecting && (
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.approveBtn}`}
            disabled={reviewPending}
            onClick={() => onReview?.('cm_approved')}
          >
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
            Approve
          </button>
          <button
            className={`${styles.actionBtn} ${styles.rejectBtn}`}
            disabled={reviewPending}
            onClick={() => setRejecting(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      )}

      {reviewable && rejecting && (
        <div className={styles.rejectBox}>
          <input
            className={styles.noteInput}
            placeholder="Reason (optional) — e.g. wrong CTA, reshoot"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmReject()}
            autoFocus
          />
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${styles.rejectBtn}`}
              disabled={reviewPending}
              onClick={confirmReject}
            >
              Confirm Reject
            </button>
            <button className={styles.actionBtn} onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {footer && <div className={styles.footerSlot}>{footer}</div>}

      {playing && <VideoPlayerModal item={item} onClose={() => setPlaying(false)} />}
    </div>
  );
};
