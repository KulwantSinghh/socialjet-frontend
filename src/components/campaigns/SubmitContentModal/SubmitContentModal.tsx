'use client';

import { useState } from 'react';
import styles from './SubmitContentModal.module.css';
import { Button } from '@/components/ui/Button';
import { detectPlatform, normalizeContentUrl, PLATFORM_LABELS } from '@/lib/contentLinks';
import type { ContentLinkInput } from '@/types/campaign.types';

interface LinkRow {
  url: string;
  caption: string;
}

interface SubmitContentModalProps {
  creatorName: string;
  /** URLs already submitted for this creator — duplicates are blocked. */
  existingUrls: string[];
  submitting: boolean;
  onSubmit: (links: ContentLinkInput[]) => void;
  onClose: () => void;
}

export const SubmitContentModal = ({
  creatorName,
  existingUrls,
  submitting,
  onSubmit,
  onClose,
}: SubmitContentModalProps) => {
  const [rows, setRows] = useState<LinkRow[]>([{ url: '', caption: '' }]);

  const existing = new Set(existingUrls.map(normalizeContentUrl));

  function rowError(row: LinkRow, index: number): string | null {
    const url = row.url.trim();
    if (!url) return null;
    if (!detectPlatform(url)) return 'Enter a valid link starting with https://';
    const normalized = normalizeContentUrl(url);
    if (existing.has(normalized)) return 'This link was already submitted';
    const firstIndex = rows.findIndex((r) => normalizeContentUrl(r.url) === normalized);
    if (firstIndex !== index) return 'Duplicate of a link above';
    return null;
  }

  const filledRows = rows.filter((r) => r.url.trim());
  const hasErrors = rows.some((row, i) => rowError(row, i) !== null);
  const canSubmit = filledRows.length > 0 && !hasErrors && !submitting;

  function updateRow(index: number, patch: Partial<LinkRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(
      filledRows.map((row) => ({
        url: row.url.trim(),
        platform: detectPlatform(row.url)!,
        caption: row.caption.trim() || undefined,
      }))
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>Submit Content Links</h3>
            <p className={styles.subtitle}>
              Paste the video links {creatorName} shared in the conversation
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
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
          {rows.map((row, index) => {
            const platform = detectPlatform(row.url);
            const error = rowError(row, index);
            return (
              <div key={index} className={styles.row}>
                <div className={styles.urlLine}>
                  <input
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="Instagram, TikTok, YouTube, Google Drive or direct video link…"
                    value={row.url}
                    onChange={(e) => updateRow(index, { url: e.target.value })}
                    autoFocus={index === 0}
                  />
                  {platform && !error && (
                    <span className={`${styles.platformChip} ${styles[`chip_${platform}`]}`}>
                      {PLATFORM_LABELS[platform]}
                    </span>
                  )}
                  {rows.length > 1 && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                      aria-label="Remove link"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {error && <span className={styles.error}>{error}</span>}
                <input
                  className={styles.captionInput}
                  placeholder="Caption (optional)"
                  value={row.caption}
                  onChange={(e) => updateRow(index, { caption: e.target.value })}
                />
              </div>
            );
          })}

          <button
            className={styles.addBtn}
            onClick={() => setRows((prev) => [...prev, { url: '', caption: '' }])}
          >
            + Add another link
          </button>
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={submitting}>
            Submit {filledRows.length > 1 ? `${filledRows.length} Links` : 'Link'}
          </Button>
        </footer>
      </div>
    </div>
  );
};
