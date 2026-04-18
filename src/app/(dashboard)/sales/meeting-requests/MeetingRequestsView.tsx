'use client';

import { useState } from 'react';
import styles from './MeetingRequestsView.module.css';
import {
  useMeetingRequests,
  useConfirmMeetingRequest,
  useDeclineMeetingRequest,
} from '@/hooks/useMeetingRequests';
import type { MeetingRequest } from '@/types/meeting-requests.types';
import { cn } from '@/lib/utils';

// ---- Icons ----
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
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

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeUntilExpiry(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
}

function SourceBadge({ source }: { source: string }) {
  const isWhatsApp = source === 'whatsapp';
  return (
    <span className={cn(styles.sourceBadge, isWhatsApp ? styles.sourceWa : styles.sourceOther)}>
      {isWhatsApp && <WhatsAppIcon />}
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
}

function RequestCard({ request }: { request: MeetingRequest }) {
  const confirm = useConfirmMeetingRequest();
  const decline = useDeclineMeetingRequest();
  const [confirmed, setConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const isPending = request.status === 'pending_approval';

  const handleConfirm = async () => {
    await confirm.mutateAsync(request.request_id);
    setConfirmed(true);
  };

  const handleDecline = async () => {
    await decline.mutateAsync({ requestId: request.request_id, suggestAlternatives: true });
    setDeclined(true);
  };

  if (confirmed) {
    return (
      <div className={cn(styles.card, styles.cardConfirmed)}>
        <div className={styles.confirmedState}>
          <div className={styles.confirmedIcon}>
            <CheckIcon />
          </div>
          <div>
            <p className={styles.confirmedTitle}>Meeting Confirmed</p>
            <p className={styles.confirmedSubtitle}>Zoom link sent to {request.lead_name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className={cn(styles.card, styles.cardDeclined)}>
        <div className={styles.confirmedState}>
          <div className={styles.declinedIcon}>
            <XIcon />
          </div>
          <div>
            <p className={styles.confirmedTitle}>Declined</p>
            <p className={styles.confirmedSubtitle}>
              Alternative slots suggested to {request.lead_name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.card, !isPending && styles.cardInactive)}>
      <div className={styles.cardHeader}>
        <div className={styles.leadInfo}>
          <div className={styles.avatar}>{request.lead_name.charAt(0).toUpperCase()}</div>
          <div>
            <p className={styles.leadName}>{request.lead_name}</p>
            {request.lead_company && <p className={styles.leadCompany}>{request.lead_company}</p>}
          </div>
        </div>
        <div className={styles.badgeGroup}>
          <SourceBadge source={request.lead_source} />
          {isPending && (
            <span className={styles.expiryBadge}>
              <ClockIcon />
              {timeUntilExpiry(request.expires_at)}
            </span>
          )}
          {!isPending && (
            <span
              className={cn(
                styles.statusBadge,
                request.status === 'confirmed' ? styles.statusConfirmed : styles.statusDeclined
              )}
            >
              {request.status}
            </span>
          )}
        </div>
      </div>

      <div className={styles.slotBlock}>
        <p className={styles.slotLabel}>Requested slot</p>
        <p className={styles.slotValue}>{formatSlot(request.requested_slot)}</p>
      </div>

      {request.conversation_context && (
        <div className={styles.context}>
          <p className={styles.contextLabel}>Context</p>
          <p className={styles.contextText}>&ldquo;{request.conversation_context}&rdquo;</p>
        </div>
      )}

      {isPending && (
        <div className={styles.actions}>
          <button
            className={styles.declineBtn}
            onClick={handleDecline}
            disabled={decline.isPending}
          >
            <XIcon />
            Decline & Suggest Other
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={confirm.isPending}
          >
            <CheckIcon />
            {confirm.isPending ? 'Booking...' : 'Confirm & Book'}
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Main Component ----
export function MeetingRequestsView() {
  const [filter, setFilter] = useState<'pending_approval' | 'all'>('pending_approval');
  const { data, isLoading } = useMeetingRequests(filter === 'all' ? undefined : 'pending_approval');
  const requests = data?.requests ?? [];
  const pendingCount = requests.filter((r) => r.status === 'pending_approval').length;

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Meeting Approvals</h1>
          <p className={styles.pageSubtitle}>
            Approve or decline meeting requests from leads — booked by the AI agent
          </p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.pendingAlert}>
            <span className={styles.pendingDot} />
            {pendingCount} request{pendingCount > 1 ? 's' : ''} waiting
          </div>
        )}
      </div>

      <div className={styles.filterRow}>
        <button
          className={cn(styles.filterBtn, filter === 'pending_approval' && styles.filterBtnActive)}
          onClick={() => setFilter('pending_approval')}
        >
          Pending Approval
          {pendingCount > 0 && <span className={styles.filterCount}>{pendingCount}</span>}
        </button>
        <button
          className={cn(styles.filterBtn, filter === 'all' && styles.filterBtnActive)}
          onClick={() => setFilter('all')}
        >
          All Requests
        </button>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.cardSkeleton} />)
        ) : requests.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>All caught up!</p>
            <p className={styles.emptySubtitle}>No pending meeting requests from leads.</p>
          </div>
        ) : (
          requests.map((req) => <RequestCard key={req.request_id} request={req} />)
        )}
      </div>
    </div>
  );
}
