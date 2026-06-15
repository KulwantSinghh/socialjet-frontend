'use client';

import { useEffect } from 'react';
import styles from './SendScheduleEmailsModal.module.css';
import type { SendScheduleEmailsPayload } from '@/types/campaign.types';
import { formatScheduleDate } from '@/lib/scheduleEmails';

export interface SendScheduleEmailsModalProps {
  payload: SendScheduleEmailsPayload;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const SendScheduleEmailsModal = ({
  payload,
  isPending = false,
  onConfirm,
  onClose,
}: SendScheduleEmailsModalProps) => {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, isPending]);

  const creatorLabel = payload.emails_sent === 1 ? 'creator' : 'creators';
  const videoLabel = payload.videos_included === 1 ? 'video' : 'videos';

  return (
    <div className={styles.overlay} onClick={isPending ? undefined : onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-schedule-emails-title"
      >
        <div className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div className={styles.headerInfo}>
            <h2 id="send-schedule-emails-title" className={styles.title}>
              Send schedule emails
            </h2>
            <p className={styles.subtitle}>{payload.brand_name}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.summary}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{payload.emails_sent}</span>
              <span className={styles.statLabel}>{creatorLabel}</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.stat}>
              <span className={styles.statValue}>{payload.videos_included}</span>
              <span className={styles.statLabel}>{videoLabel}</span>
            </div>
          </div>

          <p className={styles.hint}>
            Publish dates below will be finalized and emailed to each creator.
          </p>

          <ul className={styles.creatorList}>
            {payload.creators.map((creator) => (
              <li key={creator.creator_id} className={styles.creatorRow}>
                <div className={styles.creatorAvatar}>{getInitials(creator.creator_name)}</div>
                <div className={styles.creatorInfo}>
                  <span className={styles.creatorName}>{creator.creator_name}</span>
                  <ul className={styles.videoList}>
                    {creator.items.map((video) => (
                      <li key={video.content_id} className={styles.videoItem}>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        Publishes {formatScheduleDate(video.scheduled_at)}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className={styles.creatorBadge}>Finalized</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="button" className={styles.sendBtn} onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send {payload.emails_sent} {creatorLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
