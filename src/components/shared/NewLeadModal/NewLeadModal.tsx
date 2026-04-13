'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './NewLeadModal.module.css';
import { useCreateLead } from '@/hooks/useCreateLead';
import type { CreateLeadRequest } from '@/types/leads.types';

const SOURCE_OPTIONS: { value: CreateLeadRequest['source']; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'whatsapp', label: 'Whatsapp' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'calendly', label: 'Calendly' },
];

const EMPTY_FORM: CreateLeadRequest = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: 'manual',
  notes: '',
  deal_value: undefined,
  contact_person: '',
};

export interface NewLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewLeadModal = ({ open, onClose, onSuccess }: NewLeadModalProps) => {
  const [form, setForm] = useState<CreateLeadRequest>(EMPTY_FORM);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  const createLead = useCreateLead();

  // Reset form when opening
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setForm(EMPTY_FORM);
      setSuccessMsg('');
      setErrorMsg('');
      /* eslint-enable react-hooks/set-state-in-effect */
      createLead.reset();
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

  const set =
    (field: keyof CreateLeadRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value =
        field === 'deal_value'
          ? e.target.value
            ? Number(e.target.value)
            : undefined
          : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const required: (keyof CreateLeadRequest)[] = [
      'name',
      'company',
      'email',
      'phone',
      'notes',
      'contact_person',
    ];
    for (const field of required) {
      if (!String(form[field] ?? '').trim()) {
        const labels: Record<string, string> = {
          name: 'Name',
          company: 'Company',
          email: 'Email',
          phone: 'Phone',
          notes: 'Notes',
          contact_person: 'Contact Person',
        };
        setErrorMsg(`${labels[field]} is required.`);
        return;
      }
    }

    const payload: CreateLeadRequest = {
      ...form,
      name: form.name.trim(),
      company: (form.company ?? '').trim(),
      email: (form.email ?? '').trim(),
      phone: (form.phone ?? '').trim(),
      notes: (form.notes ?? '').trim(),
      contact_person: (form.contact_person ?? '').trim(),
    };

    createLead.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg(`✓ Lead "${form.name}" created successfully.`);
        onSuccess?.();
        setTimeout(() => onClose(), 1500);
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { detail?: { msg?: string }[] | string } } };
        const detail = e?.response?.data?.detail;
        const msg = Array.isArray(detail)
          ? detail[0]?.msg
          : typeof detail === 'string'
            ? detail
            : 'Failed to create lead. Please try again.';
        setErrorMsg(msg ?? 'Unexpected error occurred.');
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
      aria-labelledby="new-lead-title"
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
              <h2 id="new-lead-title" className={styles.title}>
                New Lead
              </h2>
              <p className={styles.subtitle}>Add a lead manually to the pipeline</p>
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
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-name">
              Name <span className={styles.required}>*</span>
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
                id="lead-name"
                className={styles.input}
                type="text"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={set('name')}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Company + Contact Person */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-company">
                Company <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="9 22 9 12 15 12 15 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  id="lead-company"
                  className={styles.input}
                  type="text"
                  placeholder="Company name"
                  value={form.company ?? ''}
                  onChange={set('company')}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-contact-person">
                Contact Person <span className={styles.required}>*</span>
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
                  </svg>
                </span>
                <input
                  id="lead-contact-person"
                  className={styles.input}
                  type="text"
                  placeholder="Point of contact"
                  value={form.contact_person ?? ''}
                  onChange={set('contact_person')}
                  autoComplete="off"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email + Phone */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-email">
                Email <span className={styles.required}>*</span>
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
                  id="lead-email"
                  className={styles.input}
                  type="email"
                  placeholder="lead@company.com"
                  value={form.email ?? ''}
                  onChange={set('email')}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-phone">
                Phone <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  id="lead-phone"
                  className={styles.input}
                  type="tel"
                  placeholder="+65 9000 0000"
                  value={form.phone ?? ''}
                  onChange={set('phone')}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </div>

          {/* Source + Deal Value */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-source">
                Source
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M12 8v4l3 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <select
                  id="lead-source"
                  className={`${styles.input} ${styles.select}`}
                  value={form.source}
                  onChange={set('source')}
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lead-deal-value">
                Deal Value <span className={styles.optional}>(optional)</span>
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
                  id="lead-deal-value"
                  className={styles.input}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.deal_value ?? ''}
                  onChange={set('deal_value')}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-notes">
              Notes <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span
                className={styles.inputIcon}
                style={{ top: 'var(--space-3)', alignItems: 'flex-start' }}
              >
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
                  <line
                    x1="16"
                    y1="13"
                    x2="8"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16"
                    y1="17"
                    x2="8"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <textarea
                id="lead-notes"
                className={styles.textarea}
                placeholder="Any additional notes about this lead..."
                value={form.notes ?? ''}
                onChange={set('notes')}
                rows={3}
                required
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
            <button type="submit" className={styles.submitBtn} disabled={createLead.isPending}>
              {createLead.isPending ? (
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
              {createLead.isPending ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
