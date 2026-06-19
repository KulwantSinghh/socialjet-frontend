'use client';

import { formatLeadSource } from '@/lib/leadAlertFormat';
import type { LeadAlert } from '@/types/leads.types';
import styles from './AlertToast.module.css';

export interface AlertToastProps {
  alert: LeadAlert;
  onClose: () => void;
}

export function AlertToast({ alert, onClose }: AlertToastProps) {
  const sourceLabel = formatLeadSource(alert.created_by, alert.source);

  return (
    <div className={styles.toast} role="alert">
      <div className={styles.accent} aria-hidden="true" />

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.title}>New notification</span>
          <span className={styles.source}>{sourceLabel}</span>
        </div>

        <div className={styles.name}>
          {alert.name}
          {alert.company ? <span className={styles.company}> · {alert.company}</span> : null}
        </div>

        {alert.message ? <p className={styles.message}>{alert.message}</p> : null}
      </div>

      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1L13 13M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
