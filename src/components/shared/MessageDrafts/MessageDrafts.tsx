'use client';

import styles from './MessageDrafts.module.css';
import { Button } from '@/components/ui/Button';

export const MessageDrafts = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-brand-purple)"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className={styles.title}>Smart Message Drafts</h3>
        </div>
      </div>

      <div className={styles.draftCard}>
        <div className={styles.draftHeader}>
          <span className={styles.context}>Context: Follow-up (Overdue)</span>
          <span className={styles.aiTag}>AI Optimized</span>
        </div>
        <p className={styles.message}>
          &quot;Hey [Creator Name], just checking in on the draft for the Summer Glow campaign.
          We&apos;re excited to see your take! Let us know if you need an extension...&quot;
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="sm" className={styles.sendBtn}>
            Send to 5 Creators
          </Button>
          <Button variant="outline" size="sm" className={styles.editBtn}>
            Edit Template
          </Button>
        </div>
      </div>

      <div className={styles.successNote}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>Outreach response rate increased by 14% using AI drafts this week.</span>
      </div>
    </div>
  );
};
