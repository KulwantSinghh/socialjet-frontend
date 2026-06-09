'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './DeleteUserModal.module.css';
import type { AdminUser } from '@/types/admin.types';

export interface DeleteUserModalProps {
  open: boolean;
  user: AdminUser | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteUserModal = ({
  open,
  user,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, isDeleting]);

  if (!open || !user) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isDeleting) onClose();
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div className={styles.modal}>
        <div className={styles.iconBadge}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="delete-user-title" className={styles.title}>
          Deactivate user
        </h2>
        <p className={styles.message}>
          Are you sure you want to deactivate{' '}
          <strong className={styles.username}>{user.username}</strong>? They will be unable to log
          in and any active session will be revoked immediately.
        </p>

        <div className={styles.note}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 8h.01M11 12h1v4h1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            This is a soft delete — the account is kept in the database and can be restored by an
            administrator.
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <span className={styles.spinner} /> : null}
            {isDeleting ? 'Deactivating...' : 'Deactivate user'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
