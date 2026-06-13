'use client';

import { useState } from 'react';
import styles from './ContentLinkCard.module.css';
import { getDirectVideoUrl, getEmbedUrl, PLATFORM_LABELS } from '@/lib/contentLinks';
import type { ContentItem, ContentStatus } from '@/types/campaign.types';

interface ContentLinkCardProps {
  item: ContentItem;
  /** Show the creator's name on the card (lead-level views). */
  showCreator?: boolean;
  /** Render Approve / Reject controls for reviewable statuses. */
  canReview?: boolean;
  onReview?: (status: 'cm_approved' | 'cm_rejected', note?: string) => void;
  reviewPending?: boolean;
  /** Allow assigning a publish date when the content isn't scheduled yet. */
  canSchedule?: boolean;
  onSchedule?: (scheduledAt: string) => void;
  schedulePending?: boolean;
  /** Extra actions below the card body. */
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

function formatScheduled(value: string): string {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const ContentLinkCard = ({
  item,
  showCreator = false,
  canReview = false,
  onReview,
  reviewPending = false,
  canSchedule = false,
  onSchedule,
  schedulePending = false,
  footer,
}: ContentLinkCardProps) => {
  const [playing, setPlaying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');

  const statusClass = styles[STATUS_CLASS[item.status]] ?? styles.statusPending;
  const reviewable = canReview && (item.status === 'pending' || item.status === 'submitted');
  const schedulable =
    canSchedule &&
    !item.scheduledAt &&
    (item.status === 'cm_approved' || item.status === 'client_approved');

  const embedUrl = getEmbedUrl(item.contentUrl, item.platform);
  const directUrl = embedUrl ? null : getDirectVideoUrl(item.contentUrl, item.platform);
  const canPlayInline = Boolean(embedUrl || directUrl);

  function confirmReject() {
    onReview?.('cm_rejected', note.trim() || undefined);
    setRejecting(false);
    setNote('');
  }

  function confirmSchedule() {
    if (!scheduleValue) return;
    onSchedule?.(scheduleValue.replace('T', ' '));
    setScheduling(false);
    setScheduleValue('');
  }

  return (
    <div className={styles.card}>
      <div className={`${styles.player} ${styles[`thumb_${item.platform}`] ?? ''}`}>
        {playing && embedUrl ? (
          <iframe
            className={styles.frame}
            src={embedUrl}
            title={`${PLATFORM_LABELS[item.platform]} video`}
            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
          />
        ) : playing && directUrl ? (
          <video className={styles.frame} src={directUrl} controls autoPlay playsInline />
        ) : (
          <button
            type="button"
            className={styles.playBtn}
            onClick={() =>
              canPlayInline ? setPlaying(true) : window.open(item.contentUrl, '_blank')
            }
            aria-label={canPlayInline ? 'Play video' : 'Open video in new tab'}
          >
            <span className={styles.playCircle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 21 12 6 21 6 3" />
              </svg>
            </span>
            <span className={styles.platformTag}>{PLATFORM_LABELS[item.platform]}</span>
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          {showCreator && <span className={styles.creator}>{item.influencerName}</span>}
          <span className={`${styles.status} ${statusClass}`}>
            {item.status.replace(/_/g, ' ')}
          </span>
        </div>
        {item.caption && <p className={styles.caption}>{item.caption}</p>}
        <a className={styles.link} href={item.contentUrl} target="_blank" rel="noreferrer">
          {item.platform === 'other'
            ? 'Open original link'
            : `Open on ${PLATFORM_LABELS[item.platform]}`}
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6M10 14 21 3" />
          </svg>
        </a>

        {item.cmNote && (
          <p className={styles.note}>
            <span className={styles.noteLabel}>CM</span> {item.cmNote}
          </p>
        )}
        {item.clientNote && (
          <p className={styles.note}>
            <span className={styles.noteLabel}>Client</span> {item.clientNote}
          </p>
        )}
        {item.scheduledAt && (
          <p className={styles.scheduled}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Publishes {formatScheduled(item.scheduledAt)}
          </p>
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

      {schedulable && !scheduling && (
        <div className={styles.footerSlot}>
          <button
            className={`${styles.actionBtn} ${styles.scheduleBtn}`}
            onClick={() => setScheduling(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Schedule Publish
          </button>
        </div>
      )}

      {schedulable && scheduling && (
        <div className={styles.rejectBox}>
          <input
            type="datetime-local"
            className={styles.noteInput}
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            autoFocus
          />
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${styles.scheduleBtn}`}
              disabled={schedulePending || !scheduleValue}
              onClick={confirmSchedule}
            >
              Confirm
            </button>
            <button className={styles.actionBtn} onClick={() => setScheduling(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {footer && <div className={styles.footerSlot}>{footer}</div>}
    </div>
  );
};
