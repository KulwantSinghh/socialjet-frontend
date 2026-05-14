'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './MeetingsView.module.css';
import { useMeetings } from '@/hooks/useMeetings';
import { useLeads } from '@/hooks/useLeads';
import { useInstantMeeting } from '@/hooks/useMeetingRequests';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { cn } from '@/lib/utils';
import { NewLeadModal } from '@/components/shared/NewLeadModal/NewLeadModal';
import type { Meeting, AvailabilityCheckResponse } from '@/types/meeting.types';
import { MEETING_TYPE_LABELS } from '@/types/meeting.types';

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ZoomIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.868v6.264a1 1 0 0 1-1.447.894L15 14v-4zM3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
  </svg>
);
const CalendarIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const TranscriptIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CancelIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const LeadIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Transcript Drawer ────────────────────────────────────────────────────────
function TranscriptDrawer({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<'transcript' | 'report'>('transcript');

  const { data: transcriptData, isLoading: transcriptLoading } = useQuery({
    queryKey: ['meeting-transcript', meeting.meeting_id],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.MEETINGS.TRANSCRIPT(meeting.meeting_id));
      return data as { raw_transcript: string; processed_at: string };
    },
    enabled: meeting.has_transcript,
    staleTime: 300_000,
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['meeting-report', meeting.meeting_id],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.MEETINGS.REPORT(meeting.meeting_id));
      return data as {
        meeting_type: string;
        summary: string;
        key_points: string[];
        objections: string[];
        next_steps: string[];
        sentiment: string;
        recommended_action: string;
        deal_probability_change: number;
      };
    },
    staleTime: 300_000,
  });

  const sentimentColor: Record<string, string> = {
    positive: 'var(--color-success-600)',
    neutral: 'var(--color-warning-600)',
    negative: 'var(--color-error-600)',
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{meeting.invitee_name}</h2>
            <p className={styles.drawerSubtitle}>
              {formatDateTime(meeting.scheduled_at)}
              {meeting.meeting_type && (
                <span className={styles.drawerTypeBadge}>
                  {MEETING_TYPE_LABELS[meeting.meeting_type] ?? meeting.meeting_type}
                </span>
              )}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className={styles.drawerTabs}>
          <button
            className={cn(
              styles.drawerTab,
              activeSection === 'transcript' && styles.drawerTabActive
            )}
            onClick={() => setActiveSection('transcript')}
          >
            Transcript
          </button>
          <button
            className={cn(styles.drawerTab, activeSection === 'report' && styles.drawerTabActive)}
            onClick={() => setActiveSection('report')}
          >
            AI Report
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* Transcript section */}
          {activeSection === 'transcript' && (
            <>
              {!meeting.has_transcript ? (
                <div className={styles.drawerEmpty}>
                  {meeting.transcript_status === 'pending'
                    ? 'Transcript is being processed. Check back shortly.'
                    : 'No transcript available for this meeting.'}
                </div>
              ) : transcriptLoading ? (
                <div className={styles.drawerSkeleton} />
              ) : (
                <pre className={styles.transcriptText}>
                  {transcriptData?.raw_transcript ?? 'Transcript not found.'}
                </pre>
              )}
            </>
          )}

          {/* Report section */}
          {activeSection === 'report' && (
            <>
              {reportLoading ? (
                <div className={styles.drawerSkeleton} />
              ) : !reportData ? (
                <div className={styles.drawerEmpty}>
                  No AI report yet.{meeting.has_transcript ? ' Report is being generated.' : ''}
                </div>
              ) : (
                <div className={styles.reportContent}>
                  {/* Meeting Type + Sentiment row */}
                  <div className={styles.reportMetaRow}>
                    {reportData.meeting_type && (
                      <span className={styles.reportTypeBadge}>
                        {MEETING_TYPE_LABELS[reportData.meeting_type] ?? reportData.meeting_type}
                      </span>
                    )}
                    {reportData.sentiment && (
                      <span
                        className={styles.reportSentiment}
                        style={{ color: sentimentColor[reportData.sentiment] }}
                      >
                        {reportData.sentiment.charAt(0).toUpperCase() +
                          reportData.sentiment.slice(1)}{' '}
                        sentiment
                      </span>
                    )}
                    {reportData.deal_probability_change !== undefined && (
                      <span
                        className={cn(
                          styles.reportDealChange,
                          reportData.deal_probability_change > 0 && styles.reportDealUp,
                          reportData.deal_probability_change < 0 && styles.reportDealDown
                        )}
                      >
                        {reportData.deal_probability_change > 0 ? '+' : ''}
                        {reportData.deal_probability_change}% deal probability
                      </span>
                    )}
                  </div>

                  <div className={styles.reportSection}>
                    <h4 className={styles.reportSectionTitle}>Summary</h4>
                    <p className={styles.reportSectionBody}>{reportData.summary}</p>
                  </div>

                  {reportData.key_points?.length > 0 && (
                    <div className={styles.reportSection}>
                      <h4 className={styles.reportSectionTitle}>Key Points</h4>
                      <ul className={styles.reportList}>
                        {reportData.key_points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportData.objections?.length > 0 && (
                    <div className={styles.reportSection}>
                      <h4 className={styles.reportSectionTitle}>Objections Raised</h4>
                      <ul className={styles.reportList}>
                        {reportData.objections.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportData.next_steps?.length > 0 && (
                    <div className={styles.reportSection}>
                      <h4 className={styles.reportSectionTitle}>Next Steps</h4>
                      <ul className={styles.reportList}>
                        {reportData.next_steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reportData.recommended_action && (
                    <div className={styles.reportRecommendation}>
                      <span className={styles.reportRecommendationLabel}>Recommended Action</span>
                      <p className={styles.reportRecommendationText}>
                        {reportData.recommended_action}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [conflict, setConflict] = useState<AvailabilityCheckResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  const rescheduleMutation = useMutation({
    mutationFn: async (scheduled_at: string) => {
      const { data } = await apiClient.patch(ENDPOINTS.MEETINGS.RESCHEDULE(meeting.meeting_id), {
        scheduled_at,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setDone(true);
    },
  });

  const checkAndSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    const scheduled_at = new Date(`${date}T${time}`).toISOString();

    setChecking(true);
    setConflict(null);
    try {
      const { data } = await apiClient.get<AvailabilityCheckResponse>(
        ENDPOINTS.MEETINGS.CHECK_AVAILABILITY,
        {
          params: {
            datetime: scheduled_at,
            duration: meeting.duration ?? 30,
            exclude_meeting_id: meeting.meeting_id,
          },
        }
      );
      setConflict(data);
      if (data.available) {
        await rescheduleMutation.mutateAsync(scheduled_at);
      }
    } finally {
      setChecking(false);
    }
  };

  const forceReschedule = async () => {
    const scheduled_at = new Date(`${date}T${time}`).toISOString();
    await rescheduleMutation.mutateAsync(scheduled_at);
  };

  // If Calendly meeting, use Calendly reschedule URL
  if (meeting.calendly_reschedule_url) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Reschedule Meeting</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.calendlyNote}>
            <p className={styles.calendlyNoteText}>
              This meeting was booked via Calendly. Use the Calendly link below to reschedule — the
              invitee will receive an updated confirmation.
            </p>
            <a
              href={meeting.calendly_reschedule_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.submitBtn}
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Open Calendly Reschedule Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Reschedule Meeting</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {done ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-success-600)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.successTitle}>Meeting Rescheduled</p>
            <p className={styles.successSubtitle}>The meeting has been updated.</p>
            <button className={styles.submitBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={checkAndSubmit}>
            <p className={styles.modalNote}>
              Currently scheduled: <strong>{formatDateTime(meeting.scheduled_at)}</strong>
            </p>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>New Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setConflict(null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setConflict(null);
                  }}
                  required
                />
              </div>
            </div>

            {/* Conflict warning */}
            {conflict && !conflict.available && (
              <div className={styles.conflictWarning}>
                <AlertIcon />
                <div>
                  <p className={styles.conflictTitle}>Time slot conflict</p>
                  <p className={styles.conflictDesc}>
                    {conflict.conflicting_invitee_name
                      ? `You already have a meeting with ${conflict.conflicting_invitee_name} at ${formatDateTime(conflict.conflicting_meeting_time!)}.`
                      : 'This time overlaps with another meeting.'}
                  </p>
                  {conflict.suggested_slots?.length > 0 && (
                    <div className={styles.suggestedSlots}>
                      <p className={styles.suggestedLabel}>Suggested slots:</p>
                      <div className={styles.slotRow}>
                        {conflict.suggested_slots.slice(0, 3).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={styles.slotBtn}
                            onClick={() => {
                              const d = new Date(slot);
                              setDate(d.toISOString().split('T')[0]);
                              setTime(d.toTimeString().slice(0, 5));
                              setConflict(null);
                            }}
                          >
                            {formatDateTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.forceBtn}
                    onClick={forceReschedule}
                    disabled={rescheduleMutation.isPending}
                  >
                    Schedule anyway
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={checking || rescheduleMutation.isPending || !date || !time}
            >
              {checking
                ? 'Checking availability...'
                : rescheduleMutation.isPending
                  ? 'Rescheduling...'
                  : 'Confirm Reschedule'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────
function CancelModal({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(ENDPOINTS.MEETINGS.CANCEL(meeting.meeting_id), {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onClose();
    },
  });

  // Calendly cancel
  if (meeting.calendly_cancel_url) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Cancel Meeting</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.calendlyNote}>
            <p className={styles.calendlyNoteText}>
              This meeting was booked via Calendly. Use the Calendly link to cancel — the invitee
              will be notified automatically.
            </p>
            <a
              href={meeting.calendly_cancel_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cancelConfirmBtn}
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Open Calendly Cancel Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cancel Meeting</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.form}>
          <p className={styles.cancelWarning}>
            Cancel meeting with <strong>{meeting.invitee_name}</strong> on{' '}
            <strong>{formatDate(meeting.scheduled_at)}</strong>? The invitee will be notified.
          </p>
          <div className={styles.field}>
            <label className={styles.label}>Reason (optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Scheduling conflict"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className={styles.cancelBtnRow}>
            <button className={styles.secondaryBtn} onClick={onClose}>
              Keep Meeting
            </button>
            <button
              className={styles.cancelConfirmBtn}
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({
  meeting,
  onViewTranscript,
  onReschedule,
  onCancel,
}: {
  meeting: Meeting;
  onViewTranscript: (m: Meeting) => void;
  onReschedule: (m: Meeting) => void;
  onCancel: (m: Meeting) => void;
}) {
  const router = useRouter();
  // has_transcript means the meeting happened even if status wasn't updated to 'done' yet
  const isPast = meeting.meeting_status === 'done' || !!meeting.has_transcript;
  const isCanceled = meeting.meeting_status === 'canceled';
  const isUpcoming = meeting.meeting_status === 'upcoming' && !meeting.has_transcript;
  const isCalendly =
    !!meeting.calendly_event_uri || meeting.event_name?.toLowerCase().includes('calendly');
  const meetingNumLabel = meeting.meeting_number
    ? `${['1st', '2nd', '3rd', '4th', '5th'][meeting.meeting_number - 1] ?? `${meeting.meeting_number}th`} Meeting`
    : null;

  return (
    <div className={cn(styles.card, isPast && styles.cardPast, isCanceled && styles.cardCanceled)}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfoBlock}>
          <p className={styles.cardName}>{meeting.invitee_name}</p>
          <p className={styles.cardEmail}>{meeting.invitee_email}</p>
        </div>
        <div className={styles.cardBadges}>
          <span
            className={cn(
              styles.sourceBadge,
              isCalendly ? styles.sourceCalendly : styles.sourceInstant
            )}
          >
            {isCalendly ? <CalendarIcon /> : <ZoomIcon />}
            {isCalendly ? 'Calendly' : 'Instant'}
          </span>
          <span
            className={cn(
              styles.statusBadge,
              isPast
                ? styles.statusDone
                : isCanceled
                  ? styles.statusCanceled
                  : styles.statusUpcoming
            )}
          >
            {meeting.meeting_status}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className={styles.cardMeta}>
        <span className={styles.cardTime}>{formatDateTime(meeting.scheduled_at)}</span>
        <div className={styles.cardTags}>
          {meetingNumLabel && <span className={styles.meetingNumTag}>{meetingNumLabel}</span>}
          {meeting.meeting_type && (
            <span className={styles.meetingTypeTag}>
              {MEETING_TYPE_LABELS[meeting.meeting_type] ?? meeting.meeting_type}
            </span>
          )}
          {meeting.lead_id && (
            <button
              className={styles.leadLinkTag}
              onClick={() => router.push(`/sales/leads/${meeting.lead_id}`)}
            >
              <LeadIcon /> View Lead
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        {/* Upcoming actions */}
        {isUpcoming && meeting.zoom_join_url && (
          <a
            href={meeting.zoom_join_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.joinBtn}
          >
            <ZoomIcon /> Join Zoom
          </a>
        )}
        {isUpcoming && (
          <>
            <button className={styles.actionBtn} onClick={() => onReschedule(meeting)}>
              <EditIcon /> Reschedule
            </button>
            <button
              className={cn(styles.actionBtn, styles.actionBtnDanger)}
              onClick={() => onCancel(meeting)}
            >
              <CancelIcon /> Cancel
            </button>
          </>
        )}

        {/* Past actions */}
        {isPast && (
          <button
            className={cn(styles.actionBtn, meeting.has_transcript && styles.actionBtnHighlight)}
            onClick={() => onViewTranscript(meeting)}
          >
            <TranscriptIcon />
            {meeting.has_transcript
              ? 'View Transcript & Report'
              : meeting.transcript_status === 'pending'
                ? 'Transcript Processing...'
                : 'No Transcript'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Instant Meeting Modal (with conflict check) ──────────────────────────────
function InstantMeetingModal({
  onClose,
  preselectedLeadId,
}: {
  onClose: () => void;
  preselectedLeadId?: string;
}) {
  const { data: leadsData, isLoading: leadsLoading } = useLeads(
    undefined,
    preselectedLeadId ? { staleTime: 0 } : undefined
  );
  const createMeeting = useInstantMeeting();
  const [leadId, setLeadId] = useState(preselectedLeadId ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [conflict, setConflict] = useState<AvailabilityCheckResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  const leads = leadsData?.leads ?? [];

  const checkAndSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!leadId || !date || !time) return;
    const scheduled_at = new Date(`${date}T${time}`).toISOString();

    setChecking(true);
    setConflict(null);
    try {
      const { data } = await apiClient.get<AvailabilityCheckResponse>(
        ENDPOINTS.MEETINGS.CHECK_AVAILABILITY,
        { params: { datetime: scheduled_at, duration } }
      );
      setConflict(data);
      if (data.available) {
        await createMeeting.mutateAsync({
          lead_id: leadId,
          scheduled_at,
          duration_minutes: duration,
        });
        setSuccess(true);
      }
    } finally {
      setChecking(false);
    }
  };

  const forceBook = async () => {
    const scheduled_at = new Date(`${date}T${time}`).toISOString();
    await createMeeting.mutateAsync({ lead_id: leadId, scheduled_at, duration_minutes: duration });
    setSuccess(true);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Book Instant Meeting</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-success-600)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.successTitle}>Meeting Created!</p>
            <p className={styles.successSubtitle}>
              Zoom link sent to the lead. Check your meetings list.
            </p>
            <button className={styles.submitBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={checkAndSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Lead</label>
              <select
                className={styles.select}
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                disabled={leadsLoading}
                required
              >
                <option value="">{leadsLoading ? 'Loading leads...' : 'Select a lead...'}</option>
                {leads.map((lead) => (
                  <option key={lead.lead_id} value={lead.lead_id}>
                    {lead.name}
                    {lead.company ? ` — ${lead.company}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setConflict(null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setConflict(null);
                  }}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Duration</label>
              <div className={styles.durationRow}>
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={cn(styles.durationBtn, duration === d && styles.durationBtnActive)}
                    onClick={() => setDuration(d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Conflict block */}
            {conflict && !conflict.available && (
              <div className={styles.conflictWarning}>
                <AlertIcon />
                <div>
                  <p className={styles.conflictTitle}>Time slot conflict detected</p>
                  <p className={styles.conflictDesc}>
                    {conflict.conflicting_invitee_name
                      ? `You already have a meeting with ${conflict.conflicting_invitee_name} at this time.`
                      : 'This time overlaps with another meeting.'}
                  </p>
                  {conflict.suggested_slots?.length > 0 && (
                    <div className={styles.suggestedSlots}>
                      <p className={styles.suggestedLabel}>Try one of these:</p>
                      <div className={styles.slotRow}>
                        {conflict.suggested_slots.slice(0, 3).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={styles.slotBtn}
                            onClick={() => {
                              const d = new Date(slot);
                              setDate(d.toISOString().split('T')[0]);
                              setTime(d.toTimeString().slice(0, 5));
                              setConflict(null);
                            }}
                          >
                            {formatDateTime(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.forceBtn}
                    onClick={forceBook}
                    disabled={createMeeting.isPending}
                  >
                    Book anyway (override)
                  </button>
                </div>
              </div>
            )}

            <p className={styles.modalNote}>
              A Zoom meeting will be created and availability will be checked before booking.
            </p>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={checking || createMeeting.isPending || !leadId || !date || !time}
            >
              {checking
                ? 'Checking availability...'
                : createMeeting.isPending
                  ? 'Creating...'
                  : 'Check & Book Meeting'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function MeetingsView() {
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [preselectedLeadId, setPreselectedLeadId] = useState<string | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [transcriptMeeting, setTranscriptMeeting] = useState<Meeting | null>(null);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(null);
  const [cancelMeeting, setCancelMeeting] = useState<Meeting | null>(null);

  const { data: upcomingData, isLoading: upcomingLoading } = useMeetings({
    meeting_status: 'upcoming',
  });
  const { data: pastData, isLoading: pastLoading } = useMeetings({ meeting_status: 'done' });
  const { data: allData, isLoading: allLoading } = useMeetings();

  const upcoming = upcomingData?.meetings ?? [];
  const past = pastData?.meetings ?? [];
  const all = allData?.meetings ?? [];

  const tabs = [
    { key: 'upcoming' as const, label: 'Upcoming', count: upcoming.length },
    { key: 'past' as const, label: 'Past', count: past.length },
    { key: 'all' as const, label: 'All Meetings', count: all.length },
  ];

  const currentList = tab === 'upcoming' ? upcoming : tab === 'past' ? past : all;
  const currentLoading =
    tab === 'upcoming' ? upcomingLoading : tab === 'past' ? pastLoading : allLoading;

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Meetings</h1>
          <p className={styles.pageSubtitle}>All meetings — leads, non-leads, Calendly and Zoom</p>
        </div>
        <div className={styles.bookDropdownWrapper}>
          <button
            className={styles.instantBtn}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <PlusIcon /> Book Meeting
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ marginLeft: 2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <>
              <div className={styles.bookDropdownBackdrop} onClick={() => setDropdownOpen(false)} />
              <div className={styles.bookDropdown}>
                <button
                  className={styles.bookDropdownItem}
                  onClick={() => {
                    setDropdownOpen(false);
                    setPreselectedLeadId(undefined);
                    setShowBookModal(true);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Book for Existing Lead
                </button>
                <button
                  className={styles.bookDropdownItem}
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowNewLeadModal(true);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Add New Lead &amp; Book Meeting
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={cn(styles.tab, tab === t.key && styles.tabActive)}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count > 0 && <span className={styles.tabCount}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {currentLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.cardSkeleton} />)
        ) : currentList.length === 0 ? (
          <div className={styles.empty}>
            <p>No {tab === 'all' ? '' : tab} meetings.</p>
            {tab === 'upcoming' && (
              <button className={styles.instantBtn} onClick={() => setShowBookModal(true)}>
                <PlusIcon /> Book Meeting
              </button>
            )}
          </div>
        ) : (
          currentList.map((m) => (
            <MeetingCard
              key={m.meeting_id}
              meeting={m}
              onViewTranscript={setTranscriptMeeting}
              onReschedule={setRescheduleMeeting}
              onCancel={setCancelMeeting}
            />
          ))
        )}
      </div>

      {showBookModal && (
        <InstantMeetingModal
          onClose={() => {
            setShowBookModal(false);
            setPreselectedLeadId(undefined);
          }}
          preselectedLeadId={preselectedLeadId}
        />
      )}
      <NewLeadModal
        open={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        onSuccess={(lead) => {
          setPreselectedLeadId(lead.lead_id);
          setShowBookModal(true);
        }}
      />
      {transcriptMeeting && (
        <TranscriptDrawer meeting={transcriptMeeting} onClose={() => setTranscriptMeeting(null)} />
      )}
      {rescheduleMeeting && (
        <RescheduleModal meeting={rescheduleMeeting} onClose={() => setRescheduleMeeting(null)} />
      )}
      {cancelMeeting && (
        <CancelModal meeting={cancelMeeting} onClose={() => setCancelMeeting(null)} />
      )}
    </div>
  );
}
