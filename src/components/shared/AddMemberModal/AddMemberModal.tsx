'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './AddMemberModal.module.css';
import { useCreateUser } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'campaign_manager', label: 'Campaign Manager' },
  { value: 'finance', label: 'Finance' },
  { value: 'client', label: 'Client' },
];

export interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddMemberModal = ({ open, onClose, onSuccess }: AddMemberModalProps) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  const createUser = useCreateUser();

  // Reset form when opening
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setUsername('');
      setRole('');
      setEmail('');
      setSuccessMsg('');
      setErrorMsg('');
      /* eslint-enable react-hooks/set-state-in-effect */
      createUser.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !role) {
      setErrorMsg('Username and Role are required.');
      return;
    }

    createUser.mutate(
      { username: username.trim(), role, email: email.trim() || undefined },
      {
        onSuccess: (data) => {
          setSuccessMsg(`✓ Member "${data.username}" created successfully as ${data.role}.`);
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { detail?: { msg?: string }[] | string } } };
          const detail = e?.response?.data?.detail;
          const msg = Array.isArray(detail)
            ? detail[0]?.msg
            : typeof detail === 'string'
              ? detail
              : 'Failed to create member. Please try again.';
          setErrorMsg(msg ?? 'Unexpected error occurred.');
        },
      }
    );
  };

  if (!open) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 8v6M22 11h-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 id="add-member-title" className={styles.title}>
                Add New Member
              </h2>
              <p className={styles.subtitle}>Create a new workspace account</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} id="add-member-form">
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-username">
              Username <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                id="member-username"
                className={styles.input}
                type="text"
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-role">
              Role <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <select
                id="member-role"
                className={cn(styles.input, styles.select)}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a role...
                </option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email (optional) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-email">
              Email <span className={styles.optional}>(optional)</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                id="member-email"
                className={styles.input}
                type="email"
                placeholder="member@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Feedback */}
          {errorMsg && <div className={styles.error}>{errorMsg}</div>}
          {successMsg && <div className={styles.success}>{successMsg}</div>}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={createUser.isPending}
              id="add-member-submit"
            >
              {createUser.isPending ? (
                <span className={styles.spinner} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 8v6M22 11h-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {createUser.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
