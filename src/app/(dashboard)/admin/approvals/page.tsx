'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useApprovals } from '@/hooks/useApprovals';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { cn } from '@/lib/utils';
import { generateProposalHTML, generateProposalPageHTML } from '@/lib/generateProposalHTML';
import { generateProposalPDFBlob } from '@/lib/generateProposalPDF';
import type { IntelligenceCall, SalesAnalysis } from '@/types/intelligence.types';

// ─── Icons ────────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const FileIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

function OutcomeChip({ outcome }: { outcome: string }) {
  const cls =
    outcome === 'positive'
      ? styles.outcomePositive
      : outcome === 'negative'
        ? styles.outcomeNegative
        : styles.outcomeNeutral;
  return (
    <span className={cn(styles.outcomeChip, cls)}>
      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
    </span>
  );
}

// ─── Left list item ───────────────────────────────────────────────────────────
function CallListItem({
  call,
  isSelected,
  doneState,
  onClick,
}: {
  call: IntelligenceCall;
  isSelected: boolean;
  doneState: 'accepted' | 'rejected' | null;
  onClick: () => void;
}) {
  const initials = call.lead_name
    ? call.lead_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <button
      className={cn(
        styles.listItem,
        isSelected && styles.listItemActive,
        doneState === 'accepted' && styles.listItemAccepted,
        doneState === 'rejected' && styles.listItemRejected
      )}
      onClick={onClick}
    >
      <div className={styles.listItemAvatar}>{initials}</div>
      <div className={styles.listItemBody}>
        <div className={styles.listItemTop}>
          <span className={styles.listItemName}>{call.lead_name}</span>
          {doneState ? (
            <span
              className={cn(
                styles.donePill,
                doneState === 'accepted' ? styles.donePillAccepted : styles.donePillRejected
              )}
            >
              {doneState === 'accepted' ? '✓ Accepted' : '✕ Rejected'}
            </span>
          ) : (
            <OutcomeChip outcome={call.call_outcome} />
          )}
        </div>
        <span className={styles.listItemCompany}>{call.lead_company}</span>
        <div className={styles.listItemMeta}>
          <span>{call.platform}</span>
          {call.duration && <span>· {call.duration}</span>}
        </div>
      </div>
      <ChevronRightIcon />
    </button>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────
function RejectModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (reason: string, notes: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Reject Proposal</h3>
          <button className={styles.modalClose} onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalField}>
            <label className={styles.modalLabel}>
              Reason <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.modalInput}
              placeholder="e.g. Budget too high"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.modalField}>
            <label className={styles.modalLabel}>
              Notes <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Reduce pricing by 10%"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.modalRejectBtn}
            onClick={() => onConfirm(reason, notes)}
            disabled={!reason.trim() || loading}
          >
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Right detail panel ───────────────────────────────────────────────────────
function ProposalDetail({
  call,
  onDone,
}: {
  call: IntelligenceCall;
  onDone: (callId: string, state: 'accepted' | 'rejected') => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [acceptingStep, setAcceptingStep] = useState<'approving' | 'sending' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: proposalData, isLoading } = useQuery({
    queryKey: ['proposal-by-meeting', call.meeting_id],
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.INTELLIGENCE.PROPOSAL_BY_MEETING(call.meeting_id)
      );
      return data as { proposal: SalesAnalysis; call_summary?: string; call_outcome?: string };
    },
    staleTime: 60_000,
  });

  const analysis: SalesAnalysis | null = proposalData
    ? {
        ...proposalData.proposal,
        call_summary: proposalData.call_summary ?? proposalData.proposal?.call_summary ?? '',
        call_outcome: proposalData.call_outcome ?? proposalData.proposal?.call_outcome ?? '',
      }
    : null;

  const downloadPDF = () => {
    if (!analysis) return;
    const html = generateProposalHTML(analysis);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 600);
  };

  const handleAccept = async () => {
    if (!analysis) return;
    setAccepting(true);
    setActionError(null);
    try {
      // Step 1: Approve
      setAcceptingStep('approving');
      await apiClient.post(ENDPOINTS.APPROVALS.APPROVE(call.call_id), { notes: 'Approved' });

      // Step 2: Generate PDF blob and send via email
      setAcceptingStep('sending');
      const blob = await generateProposalPDFBlob(analysis);
      const form = new FormData();
      form.append('pdf', blob, `proposal-${call.call_id}.pdf`);
      await apiClient.post(ENDPOINTS.APPROVALS.SEND_EMAIL(call.call_id), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onDone(call.call_id, 'accepted');
    } catch {
      setActionError('Failed to approve or send email. Please try again.');
    } finally {
      setAccepting(false);
      setAcceptingStep(null);
    }
  };

  const handleRejectConfirm = async (reason: string, notes: string) => {
    setRejecting(true);
    setActionError(null);
    try {
      await apiClient.post(ENDPOINTS.APPROVALS.REJECT(call.call_id), {
        reason,
        ...(notes.trim() ? { notes } : {}),
      });
      setShowRejectModal(false);
      onDone(call.call_id, 'rejected');
    } catch {
      setActionError('Failed to reject. Please try again.');
      setRejecting(false);
    }
  };

  return (
    <div className={styles.detail}>
      {/* Sticky action bar */}
      <div className={styles.detailBar}>
        <div className={styles.detailBarLeft}>
          <p className={styles.detailBarName}>{call.lead_name}</p>
          <p className={styles.detailBarCompany}>{call.lead_company}</p>
        </div>
        <div className={styles.detailBarRight}>
          {actionError && <span className={styles.actionError}>{actionError}</span>}
          <button className={styles.pdfBtn} onClick={downloadPDF} disabled={!analysis}>
            <DownloadIcon /> PDF
          </button>
          <button
            className={styles.btnReject}
            onClick={() => setShowRejectModal(true)}
            disabled={rejecting || accepting}
          >
            <XIcon /> Reject
          </button>
          <button
            className={styles.btnApprove}
            onClick={handleAccept}
            disabled={accepting || rejecting || !analysis}
          >
            {acceptingStep === 'approving' ? (
              'Approving…'
            ) : acceptingStep === 'sending' ? (
              'Sending PDF…'
            ) : (
              <>
                <CheckIcon /> Approve
              </>
            )}
          </button>
        </div>
      </div>

      {showRejectModal && (
        <RejectModal
          loading={rejecting}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
        />
      )}

      {/* Proposal document */}
      <div className={styles.detailBody}>
        {isLoading ? (
          <div className={styles.proposalLoading}>
            <div className={styles.proposalLoadingSpinner} />
            <span>Loading proposal…</span>
          </div>
        ) : !analysis ? (
          <div className={styles.proposalEmpty}>No proposal document found for this call.</div>
        ) : (
          <div
            className={styles.pdoc}
            dangerouslySetInnerHTML={{ __html: generateProposalPageHTML(analysis) }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useApprovals();
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [doneMap, setDoneMap] = useState<Record<string, 'accepted' | 'rejected'>>({});

  const calls = data?.calls ?? [];
  const selectedCall = calls.find((c) => c.call_id === selectedCallId) ?? null;

  const handleDone = (callId: string, state: 'accepted' | 'rejected') => {
    setDoneMap((prev) => ({ ...prev, [callId]: state }));
    void queryClient.invalidateQueries({ queryKey: ['approvals', 'pending'] });
    // Move selection to next pending call
    const next = calls.find((c) => c.call_id !== callId && !doneMap[c.call_id]);
    setSelectedCallId(next?.call_id ?? null);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading pending approvals…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>Failed to load approvals. Please try again.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Approvals
          {calls.length > 0 && <span className={styles.badge}>{calls.length}</span>}
        </h1>
        <p className={styles.subtitle}>Review proposals before they are sent to clients</p>
      </div>

      {calls.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className={styles.emptyTitle}>All caught up!</p>
          <p className={styles.emptyText}>No proposals are pending approval right now.</p>
        </div>
      ) : (
        <div className={styles.splitLayout}>
          {/* ── Left list ── */}
          <div className={styles.listPanel}>
            <p className={styles.listCount}>{calls.length} pending</p>
            <div className={styles.listScroll}>
              {calls.map((call) => (
                <CallListItem
                  key={call.call_id}
                  call={call}
                  isSelected={selectedCallId === call.call_id}
                  doneState={doneMap[call.call_id] ?? null}
                  onClick={() => setSelectedCallId(call.call_id)}
                />
              ))}
            </div>
          </div>

          {/* ── Right detail ── */}
          <div className={styles.detailPanel}>
            {selectedCall ? (
              <ProposalDetail key={selectedCall.call_id} call={selectedCall} onDone={handleDone} />
            ) : (
              <div className={styles.detailEmpty}>
                <FileIcon />
                <p className={styles.detailEmptyTitle}>Select a proposal to review</p>
                <p className={styles.detailEmptyText}>Click any item from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
