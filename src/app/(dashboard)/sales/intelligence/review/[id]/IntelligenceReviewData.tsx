'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import reviewStyles from './ReviewForm.module.css';
import { AlertBanner, TranscriptPanel, SummaryPanel, ProposalPreview } from '@/components/shared';
import { useCallStore } from '@/stores/callStore';
import { useReviewCall } from '@/hooks/useIntelligenceCalls';

export function IntelligenceReviewData({ callId }: { callId: string }) {
  const call = useCallStore((s) => s.selectedCall);
  const { mutate: submitReview, isPending, isSuccess } = useReviewCall();

  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'approved'>('reviewed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const displayName = call?.lead_company
    ? `${call.lead_company} — ${call.lead_name}`
    : (call?.lead_name ?? callId);

  // The meeting_id to use for API calls: prefer explicit meeting_id, fall back to callId
  const meetingId = call?.meeting_id || callId;
  // Transcript text: stored in call_summary when coming from a meeting
  const transcript = call?.call_summary || '';

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    submitReview(
      { callId, payload: { review_status: reviewStatus, review_notes: reviewNotes || undefined } },
      { onSuccess: () => setSubmitted(true) }
    );
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Leads Intelligence</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/sales/intelligence">Back</Link> / <span>{displayName}</span>
        </div>
      </div>

      {/* Alert banner — show if flagged */}
      {call?.flag_for_review && (
        <AlertBanner
          message={
            call.flag_reason ||
            'This call has been flagged for review before proceeding with a proposal.'
          }
        />
      )}

      {/* Analysis Grid */}
      <div className={styles.analysisGrid}>
        <TranscriptPanel meetingId={meetingId} />
        <SummaryPanel meetingId={meetingId} />
      </div>

      {/* Proposal Preview */}
      <ProposalPreview meetingId={meetingId} transcript={transcript} />

      {/* Review Form */}
      <section className={reviewStyles.root}>
        <div className={reviewStyles.header}>
          <div className={reviewStyles.titleGroup}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6C63FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <h3 className={reviewStyles.title}>Submit Review</h3>
          </div>
          {call?.review_status && call.review_status !== 'pending' && (
            <span className={reviewStyles.alreadyReviewed}>Already {call.review_status}</span>
          )}
        </div>

        {submitted || isSuccess ? (
          <div className={reviewStyles.successBanner}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Review submitted successfully.
          </div>
        ) : (
          <form className={reviewStyles.form} onSubmit={handleSubmit}>
            <div className={reviewStyles.row}>
              <div className={reviewStyles.field}>
                <label className={reviewStyles.label} htmlFor="review-status">
                  Review Decision
                </label>
                <select
                  id="review-status"
                  className={reviewStyles.select}
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as 'reviewed' | 'approved')}
                >
                  <option value="reviewed">Reviewed — Needs follow-up</option>
                  <option value="approved">Approved — Ready to send</option>
                </select>
              </div>
            </div>

            <div className={reviewStyles.field}>
              <label className={reviewStyles.label} htmlFor="review-notes">
                Review Notes <span className={reviewStyles.optional}>(optional)</span>
              </label>
              <textarea
                id="review-notes"
                className={reviewStyles.textarea}
                placeholder="Add context, corrections, or instructions for the sales team…"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className={reviewStyles.actions}>
              <button type="submit" className={reviewStyles.submitBtn} disabled={isPending}>
                {isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
