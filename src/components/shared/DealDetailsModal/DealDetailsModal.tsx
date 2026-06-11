'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import styles from './DealDetailsModal.module.css';
import { useDealDetails, useSaveDealDetails } from '@/hooks/useDealDetails';
import { cn } from '@/lib/utils';
import type { SaveDealDetailsRequest } from '@/types/dealDetails.types';

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)', 'LinkedIn'];

const AGE_GROUP_OPTIONS = ['13-17', '18-24', '18-35', '25-34', '35-44', '45-54', '55+'];

interface FormState {
  total_budget: string;
  platforms: string[];
  number_of_creators: string;
  age_group: string;
  deal_notes: string;
}

const EMPTY_FORM: FormState = {
  total_budget: '',
  platforms: [],
  number_of_creators: '',
  age_group: '',
  deal_notes: '',
};

export interface DealDetailsModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadName?: string;
  onSuccess?: () => void;
}

export const DealDetailsModal = ({
  open,
  onClose,
  leadId,
  leadName,
  onSuccess,
}: DealDetailsModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: existing, isLoading } = useDealDetails(leadId, { poll: false });
  const saveDealDetails = useSaveDealDetails();
  const isEdit = !!existing;

  // Pre-fill from existing data when opening (or reset for a fresh lead)
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (existing) {
      setForm({
        total_budget: String(existing.total_budget ?? ''),
        platforms: existing.platforms ?? [],
        number_of_creators: String(existing.number_of_creators ?? ''),
        age_group: existing.age_group ?? '',
        deal_notes: existing.deal_notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    saveDealDetails.reset();
  }, [open, existing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const togglePlatform = (platform: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const budget = Number(form.total_budget);
    const creators = Number(form.number_of_creators);

    if (!form.total_budget.trim() || Number.isNaN(budget) || budget <= 0) {
      toast.error('Total Budget must be a positive number.');
      return;
    }
    if (form.platforms.length === 0) {
      toast.error('Select at least one platform.');
      return;
    }
    if (!form.number_of_creators.trim() || !Number.isInteger(creators) || creators <= 0) {
      toast.error('Number of Creators must be a positive whole number.');
      return;
    }
    if (!form.age_group) {
      toast.error('Age Group is required.');
      return;
    }

    const payload: SaveDealDetailsRequest = {
      lead_id: leadId,
      total_budget: budget,
      platforms: form.platforms,
      number_of_creators: creators,
      age_group: form.age_group,
      deal_notes: form.deal_notes.trim() || undefined,
      updated_at: new Date().toISOString(),
    };

    saveDealDetails.mutate(payload, {
      onSuccess: () => {
        toast.success(
          isEdit ? 'Deal details updated successfully.' : 'Deal details saved successfully.'
        );
        onSuccess?.();
        onClose();
      },
      onError: (err: unknown) => {
        const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data
          ?.detail;
        toast.error(typeof detail === 'string' ? detail : 'Failed to save deal details.');
      },
    });
  };

  if (!open) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-details-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="11"
                  x2="12"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="9"
                  y1="14"
                  x2="15"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h2 id="deal-details-title" className={styles.title}>
                {isEdit ? 'Edit Lead Details' : 'Lead Details'}
              </h2>
              <p className={styles.subtitle}>
                {leadName
                  ? `Deal requirements for ${leadName}`
                  : 'Deal requirements before closing'}
              </p>
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

        {isLoading ? (
          <div className={styles.loading}>
            <span className={styles.loadingSpinner} />
            Loading deal details...
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Budget + Creators */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="deal-budget">
                  Total Budget <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="12"
                        y1="1"
                        x2="12"
                        y2="23"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    id="deal-budget"
                    className={styles.input}
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="5000"
                    value={form.total_budget}
                    onChange={(e) => setForm((prev) => ({ ...prev, total_budget: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="deal-creators">
                  Number of Creators <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    id="deal-creators"
                    className={styles.input}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="3"
                    value={form.number_of_creators}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, number_of_creators: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className={styles.field}>
              <span className={styles.label}>
                Platforms <span className={styles.required}>*</span>
              </span>
              <div className={styles.chipGroup} role="group" aria-label="Platforms">
                {PLATFORM_OPTIONS.map((platform) => {
                  const selected = form.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      className={cn(styles.chip, selected && styles.chipSelected)}
                      aria-pressed={selected}
                      onClick={() => togglePlatform(platform)}
                    >
                      {selected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <polyline points="2,7 6,11 12,3" />
                        </svg>
                      )}
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Age Group */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="deal-age-group">
                Target Age Group <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M4 21c0-4 3.6-7 8-7s8 3 8 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <select
                  id="deal-age-group"
                  className={cn(styles.input, styles.select)}
                  value={form.age_group}
                  onChange={(e) => setForm((prev) => ({ ...prev, age_group: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select age group
                  </option>
                  {AGE_GROUP_OPTIONS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="deal-notes">
                Deal Notes <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.textareaIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="14 2 14 8 20 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <textarea
                  id="deal-notes"
                  className={styles.textarea}
                  placeholder="Any extra context about this deal..."
                  value={form.deal_notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, deal_notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={saveDealDetails.isPending}
              >
                {saveDealDetails.isPending && <span className={styles.spinner} />}
                {saveDealDetails.isPending
                  ? 'Saving...'
                  : isEdit
                    ? 'Update Details'
                    : 'Save Details'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
