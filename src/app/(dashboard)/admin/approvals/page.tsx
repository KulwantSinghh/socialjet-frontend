'use client';

import { useState } from 'react';
import styles from './page.module.css';
import docStyles from './documents.module.css';
import { useApprovals } from '@/hooks/useApprovals';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { cn } from '@/lib/utils';
import { generateProposalHTML, generateProposalPageHTML } from '@/lib/generateProposalHTML';
import { generateOnboardingHTML } from '@/lib/generateOnboardingHTML';
import type { IntelligenceCall, SalesAnalysis } from '@/types/intelligence.types';
import type { PendingDocumentApproval } from '@/types/campaign.types';

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

// ─── Reject modal (shared) ────────────────────────────────────────────────────
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
          <h3 className={styles.modalTitle}>Reject Document</h3>
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
              placeholder="e.g. Please revise the campaign objectives section."
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
              placeholder="Additional notes…"
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

// ─── Proposals section ────────────────────────────────────────────────────────

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
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win)
      setTimeout(() => {
        win.focus();
        win.print();
        URL.revokeObjectURL(url);
      }, 800);
    else URL.revokeObjectURL(url);
  };

  const handleAccept = async () => {
    if (!analysis) return;
    setAccepting(true);
    setActionError(null);
    try {
      setAcceptingStep('approving');
      await apiClient.post(ENDPOINTS.APPROVALS.APPROVE(call.call_id), { notes: 'Approved' });
      setAcceptingStep('sending');
      const html = generateProposalHTML(analysis);
      await apiClient.post(ENDPOINTS.APPROVALS.SEND_EMAIL(call.call_id), { html });
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

// ─── Documents section ────────────────────────────────────────────────────────

function DocListItem({
  doc,
  isSelected,
  doneState,
  onClick,
}: {
  doc: PendingDocumentApproval;
  isSelected: boolean;
  doneState: 'approved' | 'rejected' | null;
  onClick: () => void;
}) {
  const initials = doc.lead_name
    ? doc.lead_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';
  const submittedDate = doc.submitted_at
    ? new Date(doc.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';

  return (
    <button
      className={cn(
        styles.listItem,
        isSelected && styles.listItemActive,
        doneState === 'approved' && styles.listItemAccepted,
        doneState === 'rejected' && styles.listItemRejected
      )}
      onClick={onClick}
    >
      <div className={styles.listItemAvatar}>{initials}</div>
      <div className={styles.listItemBody}>
        <div className={styles.listItemTop}>
          <span className={styles.listItemName}>{doc.lead_name}</span>
          {doneState ? (
            <span
              className={cn(
                styles.donePill,
                doneState === 'approved' ? styles.donePillAccepted : styles.donePillRejected
              )}
            >
              {doneState === 'approved' ? '✓ Approved' : '✕ Rejected'}
            </span>
          ) : (
            <span className={docStyles.pendingPill}>Pending</span>
          )}
        </div>
        <span className={styles.listItemCompany}>{doc.lead_company}</span>
        <div className={styles.listItemMeta}>
          <span>{doc.doc_type === 'onboarding' ? 'Onboarding Doc' : doc.doc_type}</span>
          {submittedDate && <span>· {submittedDate}</span>}
        </div>
      </div>
      <ChevronRightIcon />
    </button>
  );
}

function DocumentDetail({
  doc,
  onDone,
}: {
  doc: PendingDocumentApproval;
  onDone: (id: string, state: 'approved' | 'rejected') => void;
}) {
  const [approving, setApproving] = useState(false);
  const [approvingStep, setApprovingStep] = useState<'approving' | 'sending' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasDocument = !!doc.document;

  const getHTML = () => {
    if (!doc.document) return '';
    return generateOnboardingHTML(doc.document, doc.lead_name, doc.lead_email);
  };

  const downloadPDF = () => {
    const html = getHTML();
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win)
      setTimeout(() => {
        win.focus();
        win.print();
        URL.revokeObjectURL(url);
      }, 800);
    else URL.revokeObjectURL(url);
  };

  const handleApprove = async () => {
    setApproving(true);
    setActionError(null);
    try {
      setApprovingStep('approving');
      await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.APPROVE_DOCUMENT(doc.onboarding_id));

      setApprovingStep('sending');
      const html = getHTML();
      const brandName = doc.document?.brand?.name || doc.lead_company;
      await apiClient.post(ENDPOINTS.CAMPAIGN_DOCUMENTS.ONBOARDING_SEND_PDF(doc.lead_id), {
        html,
        to_email: doc.lead_email,
        subject: `SocialJet × ${brandName} — Onboarding Document`,
        message: '',
      });

      onDone(doc.onboarding_id, 'approved');
    } catch {
      setActionError('Failed to approve or send document. Please try again.');
    } finally {
      setApproving(false);
      setApprovingStep(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setRejecting(true);
    setActionError(null);
    try {
      await apiClient.post(ENDPOINTS.CAMPAIGN_APPROVALS.REJECT_DOCUMENT(doc.onboarding_id), {
        reason,
      });
      setShowRejectModal(false);
      onDone(doc.onboarding_id, 'rejected');
    } catch {
      setActionError('Failed to reject. Please try again.');
      setRejecting(false);
    }
  };

  return (
    <div className={styles.detail}>
      <div className={styles.detailBar}>
        <div className={styles.detailBarLeft}>
          <p className={styles.detailBarName}>{doc.lead_name}</p>
          <p className={styles.detailBarCompany}>
            {doc.lead_company} · {doc.lead_email}
          </p>
        </div>
        <div className={styles.detailBarRight}>
          {actionError && <span className={styles.actionError}>{actionError}</span>}
          <button className={styles.pdfBtn} onClick={downloadPDF} disabled={!hasDocument}>
            <DownloadIcon /> PDF
          </button>
          <button
            className={styles.btnReject}
            onClick={() => setShowRejectModal(true)}
            disabled={rejecting || approving}
          >
            <XIcon /> Reject
          </button>
          <button
            className={styles.btnApprove}
            onClick={handleApprove}
            disabled={approving || rejecting || !hasDocument}
          >
            {approvingStep === 'approving' ? (
              'Approving…'
            ) : approvingStep === 'sending' ? (
              'Sending PDF…'
            ) : (
              <>
                <CheckIcon /> Approve & Send
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

      <div className={styles.detailBody}>
        {!hasDocument ? (
          <div className={styles.proposalEmpty}>Document content not available.</div>
        ) : (
          <div className={styles.pdoc} dangerouslySetInnerHTML={{ __html: getHTML() }} />
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'proposals' | 'documents'>('proposals');

  // Proposals
  const {
    data: proposalsData,
    isLoading: proposalsLoading,
    isError: proposalsError,
  } = useApprovals();
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [callDoneMap, setCallDoneMap] = useState<Record<string, 'accepted' | 'rejected'>>({});

  // Documents
  const {
    data: docsData,
    isLoading: docsLoading,
    isError: docsError,
  } = useQuery({
    queryKey: ['pending-document-approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN_APPROVALS.PENDING_DOCUMENTS);
      return data as { documents: PendingDocumentApproval[]; count: number };
    },
    staleTime: 30_000,
  });
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docDoneMap, setDocDoneMap] = useState<Record<string, 'approved' | 'rejected'>>({});

  const calls = proposalsData?.calls ?? [];
  const selectedCall = calls.find((c) => c.call_id === selectedCallId) ?? null;

  const documents = docsData?.documents ?? [];
  const selectedDoc = documents.find((d) => d.onboarding_id === selectedDocId) ?? null;

  const handleCallDone = (callId: string, state: 'accepted' | 'rejected') => {
    setCallDoneMap((prev) => ({ ...prev, [callId]: state }));
    void queryClient.invalidateQueries({ queryKey: ['approvals', 'pending'] });
    const next = calls.find((c) => c.call_id !== callId && !callDoneMap[c.call_id]);
    setSelectedCallId(next?.call_id ?? null);
  };

  const handleDocDone = (id: string, state: 'approved' | 'rejected') => {
    setDocDoneMap((prev) => ({ ...prev, [id]: state }));
    void queryClient.invalidateQueries({ queryKey: ['pending-document-approvals'] });
    const next = documents.find((d) => d.onboarding_id !== id && !docDoneMap[d.onboarding_id]);
    setSelectedDocId(next?.onboarding_id ?? null);
  };

  const isLoading = activeTab === 'proposals' ? proposalsLoading : docsLoading;
  const isError = activeTab === 'proposals' ? proposalsError : docsError;

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

  const pendingDocsCount = documents.filter((d) => !docDoneMap[d.onboarding_id]).length;

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Approvals
          {(calls.length > 0 || pendingDocsCount > 0) && (
            <span className={styles.badge}>{calls.length + pendingDocsCount}</span>
          )}
        </h1>
        <p className={styles.subtitle}>
          Review proposals and onboarding documents before they are sent to clients
        </p>
      </div>

      {/* Tabs */}
      <div className={docStyles.tabs}>
        <button
          className={cn(docStyles.tab, activeTab === 'proposals' && docStyles.tabActive)}
          onClick={() => setActiveTab('proposals')}
        >
          Sales Proposals
          {calls.length > 0 && <span className={docStyles.tabBadge}>{calls.length}</span>}
        </button>
        <button
          className={cn(docStyles.tab, activeTab === 'documents' && docStyles.tabActive)}
          onClick={() => setActiveTab('documents')}
        >
          Onboarding Documents
          {pendingDocsCount > 0 && <span className={docStyles.tabBadge}>{pendingDocsCount}</span>}
        </button>
      </div>

      {/* ── Proposals tab ── */}
      {activeTab === 'proposals' &&
        (calls.length === 0 ? (
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
            <div className={styles.listPanel}>
              <p className={styles.listCount}>{calls.length} pending</p>
              <div className={styles.listScroll}>
                {calls.map((call) => (
                  <CallListItem
                    key={call.call_id}
                    call={call}
                    isSelected={selectedCallId === call.call_id}
                    doneState={callDoneMap[call.call_id] ?? null}
                    onClick={() => setSelectedCallId(call.call_id)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.detailPanel}>
              {selectedCall ? (
                <ProposalDetail
                  key={selectedCall.call_id}
                  call={selectedCall}
                  onDone={handleCallDone}
                />
              ) : (
                <div className={styles.detailEmpty}>
                  <FileIcon />
                  <p className={styles.detailEmptyTitle}>Select a proposal to review</p>
                  <p className={styles.detailEmptyText}>Click any item from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        ))}

      {/* ── Documents tab ── */}
      {activeTab === 'documents' &&
        (documents.length === 0 ? (
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
            <p className={styles.emptyText}>
              No onboarding documents are pending approval right now.
            </p>
          </div>
        ) : (
          <div className={styles.splitLayout}>
            <div className={styles.listPanel}>
              <p className={styles.listCount}>{documents.length} pending</p>
              <div className={styles.listScroll}>
                {documents.map((doc) => (
                  <DocListItem
                    key={doc.onboarding_id}
                    doc={doc}
                    isSelected={selectedDocId === doc.onboarding_id}
                    doneState={docDoneMap[doc.onboarding_id] ?? null}
                    onClick={() => setSelectedDocId(doc.onboarding_id)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.detailPanel}>
              {selectedDoc ? (
                <DocumentDetail
                  key={selectedDoc.onboarding_id}
                  doc={selectedDoc}
                  onDone={handleDocDone}
                />
              ) : (
                <div className={styles.detailEmpty}>
                  <FileIcon />
                  <p className={styles.detailEmptyTitle}>Select a document to review</p>
                  <p className={styles.detailEmptyText}>Click any item from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
