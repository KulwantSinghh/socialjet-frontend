'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './LeadDetailView.module.css';
import { useLeadTimeline } from '@/hooks/useLeadTimeline';
import { useInstantMeeting } from '@/hooks/useMeetingRequests';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/leads.types';
import type { TimelineEvent } from '@/types/timeline.types';
import type { Meeting, AvailabilityCheckResponse } from '@/types/meeting.types';
import type { SalesAnalysis } from '@/types/intelligence.types';
import { MEETING_TYPE_LABELS } from '@/types/meeting.types';
import { TIMELINE_EVENT_LABELS } from '@/types/timeline.types';

// ─── Journey stages ───────────────────────────────────────────────────────────
const JOURNEY_STAGES = [
  { key: 'captured', label: 'Captured', statuses: ['new'] },
  { key: 'nurturing', label: 'Nurturing', statuses: ['contacted', 'nurture'] },
  { key: 'meeting', label: 'Meeting', statuses: ['qualified', 'meeting_booked'] },
  { key: 'proposal', label: 'Proposal', statuses: ['proposal', 'proposal_ready', 'proposal_sent'] },
  { key: 'closed', label: 'Closed', statuses: ['closed'] },
];

function getStageIndex(status: string): number {
  if (status === 'canceled') return -1;
  for (let i = 0; i < JOURNEY_STAGES.length; i++) {
    if (JOURNEY_STAGES[i].statuses.includes(status)) return i;
  }
  return 0;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const MailIcon = () => (
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
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.94a16 16 0 0 0 6.05 6.05l1.85-1.85a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const VideoIcon = () => (
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
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const FileIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EVENT_COLORS: Record<string, string> = {
  lead_created: '#6c63ff',
  welcome_email_sent: '#3b82f6',
  message_sent: '#3b82f6',
  meeting_booked: '#f59e0b',
  first_meeting_booked: '#f59e0b',
  second_meeting_booked: '#f59e0b',
  third_meeting_booked: '#f59e0b',
  meeting_done: '#8b5cf6',
  meeting_completed: '#8b5cf6',
  transcript_ready: '#06b6d4',
  meeting_report_ready: '#06b6d4',
  proposal_generated: '#f97316',
  proposal_approved: '#22c55e',
  proposal_sent: '#16a34a',
  client_accepted: '#16a34a',
  deal_closed: '#16a34a',
  status_changed: '#6b7280',
  email_sent: '#3b82f6',
  nurture_email_sent: '#3b82f6',
  nurture_email_opened: '#22c55e',
  nurture_email_replied: '#22c55e',
  whatsapp_sent: '#25d366',
  whatsapp_replied: '#25d366',
  sequence_paused: '#f59e0b',
  lead_marked_dead: '#ef4444',
  no_response_escalation: '#ef4444',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#6c63ff',
  nurture: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#22c55e',
  proposal: '#f97316',
  proposal_sent: '#16a34a',
  closed: '#16a34a',
  canceled: '#ef4444',
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  contact_form: 'Web Form',
  calendly: 'Calendly',
  manual: 'Manual',
};

const MEETING_NUMBER_LABELS: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ─── Journey Stage Stepper (vertical) ────────────────────────────────────────
function JourneyStepper({ status }: { status: string }) {
  const isDead = status === 'canceled';
  const currentIdx = getStageIndex(status);

  if (isDead) return <span className={styles.journeyDeadBadge}>Dead Lead</span>;

  return (
    <>
      {JOURNEY_STAGES.map((stage, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={stage.key} className={cn(styles.journeyStep, done && styles.journeyStepDone)}>
            <div className={styles.journeyDotWrap}>
              <div
                className={cn(
                  styles.journeyDot,
                  done && styles.journeyDotDone,
                  active && styles.journeyDotActive
                )}
              >
                {done ? <CheckIcon /> : <span>{idx + 1}</span>}
              </div>
            </div>
            <div className={styles.journeyInfo}>
              <span
                className={cn(
                  styles.journeyLabel,
                  active && styles.journeyLabelActive,
                  done && styles.journeyLabelDone
                )}
              >
                {stage.label}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Timeline Row ─────────────────────────────────────────────────────────────
function TimelineRow({ event }: { event: TimelineEvent }) {
  const color = EVENT_COLORS[event.event_type] ?? '#6b7280';
  const displayTitle =
    event.title || TIMELINE_EVENT_LABELS[event.event_type] || event.event_type.replace(/_/g, ' ');

  return (
    <div className={styles.timelineRow}>
      <div
        className={styles.timelineDot}
        style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }}
      />
      <div className={styles.timelineContent}>
        <div className={styles.timelineTop}>
          <span className={styles.timelineTitle}>{displayTitle}</span>
          <span className={styles.timelineTime}>{formatDate(event.created_at)}</span>
        </div>
        {event.description && <p className={styles.timelineDesc}>{event.description}</p>}
        {event.actor_type === 'ai' && <span className={styles.aiBadge}>AI</span>}
        {event.metadata?.zoom_join_url && (
          <a
            href={event.metadata.zoom_join_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.timelineLink}
          >
            Join Zoom Meeting
          </a>
        )}
        {event.metadata?.meeting_id && !event.metadata.zoom_join_url && (
          <Link href="/sales/meetings" className={styles.timelineLink}>
            View Meeting
          </Link>
        )}
        {event.metadata?.proposal_id && (
          <button
            className={styles.timelineLink}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => document.getElementById('proposals-tab')?.click()}
          >
            View Proposal
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({
  meeting,
  onViewTranscript,
}: {
  meeting: Meeting;
  onViewTranscript: (m: Meeting) => void;
}) {
  const meetingNum = meeting.meeting_number ?? 1;
  const numLabel = MEETING_NUMBER_LABELS[meetingNum] ?? `${meetingNum}th`;
  const typeLabel = meeting.meeting_type ? MEETING_TYPE_LABELS[meeting.meeting_type] : null;
  const isPast = meeting.meeting_status === 'done' || !!meeting.has_transcript;

  const sentimentColor = {
    positive: '#22c55e',
    neutral: '#f59e0b',
    negative: '#ef4444',
  };

  return (
    <div className={styles.meetingCard}>
      <div className={styles.meetingCardHeader}>
        <div className={styles.meetingCardLeft}>
          <span className={styles.meetingNumber}>{numLabel} Meeting</span>
          {typeLabel && <span className={styles.meetingTypeBadge}>{typeLabel}</span>}
        </div>
        <span
          className={cn(
            styles.meetingStatusBadge,
            isPast && styles.meetingStatusDone,
            !isPast && meeting.meeting_status === 'upcoming' && styles.meetingStatusUpcoming,
            meeting.meeting_status === 'canceled' && styles.meetingStatusCanceled
          )}
        >
          {isPast
            ? 'Done'
            : meeting.meeting_status.charAt(0).toUpperCase() + meeting.meeting_status.slice(1)}
        </span>
      </div>

      <div className={styles.meetingCardMeta}>
        <span className={styles.meetingMetaItem}>
          <CalendarIcon />
          {formatDate(meeting.scheduled_at)}
        </span>
        {meeting.duration && (
          <span className={styles.meetingMetaItem}>
            <VideoIcon />
            {meeting.duration}
          </span>
        )}
      </div>

      {meeting.report && (
        <div className={styles.meetingReport}>
          <p className={styles.meetingReportSummary}>{meeting.report.summary}</p>
          <div className={styles.meetingReportMeta}>
            {meeting.report.sentiment && (
              <span
                className={styles.sentimentBadge}
                style={{ color: sentimentColor[meeting.report.sentiment] }}
              >
                {meeting.report.sentiment.charAt(0).toUpperCase() +
                  meeting.report.sentiment.slice(1)}{' '}
                sentiment
              </span>
            )}
            {meeting.report.deal_probability_change !== undefined && (
              <span
                className={cn(
                  styles.dealProbChange,
                  meeting.report.deal_probability_change > 0 && styles.dealProbUp,
                  meeting.report.deal_probability_change < 0 && styles.dealProbDown
                )}
              >
                {meeting.report.deal_probability_change > 0 ? '+' : ''}
                {meeting.report.deal_probability_change}% deal probability
              </span>
            )}
          </div>
          {meeting.report.next_steps?.length > 0 && (
            <div className={styles.nextSteps}>
              <span className={styles.nextStepsLabel}>Next steps:</span>
              <ul className={styles.nextStepsList}>
                {meeting.report.next_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={styles.meetingCardActions}>
        {!isPast && meeting.zoom_join_url && (
          <a
            href={meeting.zoom_join_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.meetingActionBtn}
          >
            <VideoIcon /> Join Zoom
          </a>
        )}
        {meeting.has_transcript && (
          <button className={styles.meetingActionBtn} onClick={() => onViewTranscript(meeting)}>
            <FileIcon /> View Transcript & Report
          </button>
        )}
        {isPast && !meeting.has_transcript && (
          <span className={styles.meetingNoTranscript}>
            {meeting.transcript_status === 'pending' ? 'Transcript processing...' : 'No transcript'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Meeting Analysis Card ────────────────────────────────────────────────────
// ─── Editor toolbar icons ─────────────────────────────────────────────────────
const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z" />
  </svg>
);
const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <line
      x1="19"
      y1="4"
      x2="10"
      y2="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="20"
      x2="5"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="15"
      y1="4"
      x2="9"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const UnderlineIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M6 3v7a6 6 0 0 0 12 0V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);
const LinkIconTb = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const ImageIconTb = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const ListIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="4" cy="18" r="1" fill="currentColor" />
  </svg>
);
const OListIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 10h2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
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
const EditPenIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const RefreshIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
  </svg>
);

function MeetingAnalysisCard({ meeting }: { meeting: Meeting }) {
  const meetingNum = meeting.meeting_number ?? 1;
  const numLabel = MEETING_NUMBER_LABELS[meetingNum] ?? `${meetingNum}th`;
  const typeLabel = meeting.meeting_type ? MEETING_TYPE_LABELS[meeting.meeting_type] : null;

  const [analysis, setAnalysis] = useState<SalesAnalysis | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount: try to load existing proposal first
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await apiClient.get(
          ENDPOINTS.INTELLIGENCE.PROPOSAL_BY_MEETING(meeting.meeting_id)
        );
        if (!cancelled && data?.proposal) {
          setAnalysis({
            ...data.proposal,
            call_summary: data.call_summary,
            call_outcome: data.call_outcome,
          });
          setCallId(data.call_id);
          setReviewStatus(data.review_status ?? '');
        }
      } catch {
        // No proposal yet — show Generate button
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [meeting.meeting_id]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{ proposal: SalesAnalysis; call_id?: string }>(
        ENDPOINTS.INTELLIGENCE.ANALYZE,
        { meeting_id: meeting.meeting_id }
      );
      setAnalysis(data.proposal);
      if (data.call_id) setCallId(data.call_id);
    } catch {
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveEdits = async () => {
    if (!callId) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        proposal_status: 'revised',
        call_summary: analysis?.call_summary ?? '',
        client_needs: analysis?.client_needs ?? '',
        campaign_objective: analysis?.campaign_objective ?? '',
        proposal: analysis ?? {},
      };
      await apiClient.patch(ENDPOINTS.INTELLIGENCE.UPDATE_PROPOSAL(callId), body, {
        headers: { 'Content-Type': 'application/json' },
      });
      setIsEditing(false);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sendForApproval = async () => {
    if (!callId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post(ENDPOINTS.INTELLIGENCE.SUBMIT_PROPOSAL(callId));
      setReviewStatus('pending_approval');
      setSubmitSuccess(true);
    } catch {
      setError('Failed to submit for approval. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmd = (command: string, value?: string) => {
    (document as any).execCommand(command, false, value ?? null);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) cmd('createLink', url);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) cmd('insertImage', ev.target.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Inline all computed styles so the output is pixel-perfect in any window/renderer
  const inlineStyles = (root: HTMLElement): HTMLElement => {
    const clone = root.cloneNode(true) as HTMLElement;
    const origEls = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    const cloneEls = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
    const PROPS = [
      'background',
      'backgroundColor',
      'backgroundImage',
      'backgroundSize',
      'backgroundPosition',
      'backgroundRepeat',
      'color',
      'fontSize',
      'fontWeight',
      'fontFamily',
      'fontStyle',
      'fontVariant',
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'border',
      'borderTop',
      'borderRight',
      'borderBottom',
      'borderLeft',
      'borderColor',
      'borderWidth',
      'borderStyle',
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'display',
      'flexDirection',
      'flexWrap',
      'flex',
      'flexShrink',
      'flexGrow',
      'gap',
      'alignItems',
      'justifyContent',
      'gridTemplateColumns',
      'gridColumn',
      'gridRow',
      'columnGap',
      'rowGap',
      'width',
      'maxWidth',
      'minWidth',
      'height',
      'maxHeight',
      'minHeight',
      'boxSizing',
      'textTransform',
      'letterSpacing',
      'lineHeight',
      'textDecoration',
      'textAlign',
      'opacity',
      'overflow',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'zIndex',
      'boxShadow',
      'whiteSpace',
      'wordBreak',
      'listStyleType',
      'listStylePosition',
    ];
    origEls.forEach((orig, i) => {
      const cs = window.getComputedStyle(orig);
      const styles = PROPS.map((p) => {
        const val = cs.getPropertyValue(p.replace(/([A-Z])/g, '-$1').toLowerCase());
        return val ? `${p.replace(/([A-Z])/g, '-$1').toLowerCase()}:${val}` : '';
      })
        .filter(Boolean)
        .join(';');
      cloneEls[i].setAttribute('style', styles);
      // Remove class so no stale CSS interferes
      cloneEls[i].removeAttribute('class');
    });
    return clone;
  };

  const buildPrintHTML = (bodyHTML: string, forWord = false) => {
    const a4 = forWord
      ? `@page WordSection1{size:21.0cm 29.7cm;margin:2cm} div.WordSection1{page:WordSection1}`
      : `@page{size:A4 portrait;margin:15mm 18mm} @media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}}`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Proposal — ${analysis?.campaign_objective ?? 'SocialJet'}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;padding:0}${a4}</style>
    </head><body${forWord ? ' class="WordSection1"' : ''}>${bodyHTML}</body></html>`;
  };

  const downloadPDF = () => {
    const el = docRef.current;
    if (!el) return;
    const inlined = inlineStyles(el);
    inlined.style.cssText += ';max-width:794px;margin:0 auto;box-shadow:none;border-radius:0';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildPrintHTML(inlined.outerHTML));
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };

  const downloadWord = () => {
    const el = docRef.current;
    if (!el) return;
    const inlined = inlineStyles(el);
    inlined.style.cssText += ';max-width:100%;margin:0 auto';
    const html = buildPrintHTML(`<div class="WordSection1">${inlined.outerHTML}</div>`, true);
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal — ${(analysis?.campaign_objective ?? 'SocialJet').slice(0, 60)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.analysisLoading}>
        <div className={styles.analysisLoadingSpinner} />
        <div className={styles.analysisLoadingText}>
          <p className={styles.analysisLoadingTitle}>Loading proposal…</p>
          <p className={styles.analysisLoadingSubtitle}>Checking for existing proposal</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={styles.analysisGenCard}>
        <div className={styles.analysisGenLeft}>
          <div className={styles.analysisGenMeta}>
            <span className={styles.meetingTypeBadge}>{numLabel} Meeting</span>
            {typeLabel && <span className={styles.meetingTypeBadge}>{typeLabel}</span>}
            <span className={styles.proposalMetaItem}>
              <CalendarIcon />
              {formatShortDate(meeting.scheduled_at)}
            </span>
          </div>
          <p className={styles.analysisGenHint}>
            {meeting.has_transcript
              ? 'Transcript available — click Generate to create a full proposal.'
              : 'Transcript required. Complete the meeting first.'}
          </p>
          {error && <p className={styles.analysisGenError}>{error}</p>}
        </div>
        <button
          className={cn(styles.proposalActionBtn, styles.proposalSendBtn, styles.analysisGenBtn)}
          disabled={!meeting.has_transcript}
          onClick={generate}
          title={!meeting.has_transcript ? 'Transcript needed' : undefined}
        >
          <FileIcon /> Generate Proposal
        </button>
      </div>
    );
  }

  return (
    <div className={styles.analysisWrap}>
      {/* Action bar */}
      <div className={styles.analysisActionBar}>
        <div className={styles.analysisActionLeft}>
          <span className={styles.meetingTypeBadge}>{numLabel} Meeting</span>
          {typeLabel && <span className={styles.meetingTypeBadge}>{typeLabel}</span>}
          <span className={styles.proposalMetaItem}>
            <CalendarIcon />
            {formatShortDate(meeting.scheduled_at)}
          </span>
        </div>
        <div className={styles.analysisActionRight}>
          {isEditing ? (
            <>
              <button
                className={cn(styles.analysisBarBtn, styles.analysisBarBtnSave)}
                onClick={saveEdits}
                disabled={saving}
              >
                {saving ? (
                  'Saving…'
                ) : (
                  <>
                    <CheckIcon /> Save Changes
                  </>
                )}
              </button>
              <button className={styles.analysisBarBtnGhost} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className={cn(styles.analysisBarBtn, styles.analysisBarBtnActive)}
                onClick={() => setIsEditing(true)}
              >
                <EditPenIcon /> Edit
              </button>
              <button className={styles.analysisBarBtn} onClick={downloadPDF}>
                <DownloadIcon /> PDF
              </button>
              <button className={styles.analysisBarBtn} onClick={downloadWord}>
                <DownloadIcon /> Word
              </button>
              <button
                className={styles.analysisBarBtnGhost}
                onClick={generate}
                title="Re-generate from transcript"
              >
                <RefreshIcon /> Re-generate
              </button>
              {reviewStatus === 'pending_approval' || submitSuccess ? (
                <span className={styles.approvalSentBadge}>✓ Sent for Approval</span>
              ) : (
                <button
                  className={styles.sendApprovalBtn}
                  onClick={sendForApproval}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Send for Approval'}
                </button>
              )}
            </>
          )}
          {error && <span className={styles.analysisGenError}>{error}</span>}
        </div>
      </div>

      {/* Editor toolbar — only when editing */}
      {isEditing && (
        <div className={styles.editorToolbar}>
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd('bold');
            }}
            title="Bold"
          >
            <BoldIcon />
          </button>
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd('italic');
            }}
            title="Italic"
          >
            <ItalicIcon />
          </button>
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd('underline');
            }}
            title="Underline"
          >
            <UnderlineIcon />
          </button>
          <div className={styles.editorToolbarDivider} />
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd('insertUnorderedList');
            }}
            title="Bullet list"
          >
            <ListIcon />
          </button>
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd('insertOrderedList');
            }}
            title="Numbered list"
          >
            <OListIcon />
          </button>
          <div className={styles.editorToolbarDivider} />
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              insertLink();
            }}
            title="Insert link"
          >
            <LinkIconTb />
          </button>
          <button
            className={styles.editorToolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            title="Insert image"
          >
            <ImageIconTb />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFile}
          />
          <div className={styles.editorToolbarDivider} />
          <span className={styles.editorToolbarHint}>
            Click to select text, then apply formatting
          </span>
        </div>
      )}

      {/* Proposal document */}
      <div
        ref={docRef}
        className={cn(styles.pdoc, isEditing && styles.pdocEditing)}
        contentEditable={isEditing}
        suppressContentEditableWarning
      >
        {/* Header */}
        <div className={styles.pdocHeader}>
          <div className={styles.pdocLogo}>Social Jet · Influencer Marketing Agency</div>
          <h1 className={styles.pdocTitle}>
            {analysis!.campaign_objective || 'Campaign Proposal'}
          </h1>
          <div className={styles.pdocMeta}>
            <span>Prepared: {formatShortDate(new Date().toISOString())}</span>
            {analysis!.timeline && <span>Timeline: {analysis!.timeline}</span>}
            {analysis!.call_outcome && <span>Outcome: {analysis!.call_outcome}</span>}
          </div>
        </div>

        <div className={styles.pdocBody}>
          {/* KPI bar — always shown */}
          <div className={styles.pdocKpis}>
            <div className={styles.pdocKpi}>
              <div className={styles.pdocKpiLabel}>Budget</div>
              <div className={styles.pdocKpiValue}>
                {analysis!.budget || <span className={styles.pdocEmpty}>TBD</span>}
              </div>
            </div>
            <div className={styles.pdocKpi}>
              <div className={styles.pdocKpiLabel}>Timeline</div>
              <div className={styles.pdocKpiValue}>
                {analysis!.timeline || <span className={styles.pdocEmpty}>TBD</span>}
              </div>
            </div>
            <div className={styles.pdocKpi}>
              <div className={styles.pdocKpiLabel}>Outcome</div>
              <div className={styles.pdocKpiValue}>
                {analysis!.call_outcome || <span className={styles.pdocEmpty}>—</span>}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Participants</div>
            {analysis!.participants?.length > 0 ? (
              <ul className={styles.pdocList}>
                {analysis!.participants.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.pdocEmpty}>No participants listed.</p>
            )}
          </div>

          {/* Executive Summary */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Executive Summary</div>
            <p className={styles.pdocText}>
              {analysis!.call_summary || (
                <span className={styles.pdocEmpty}>No summary available.</span>
              )}
            </p>
          </div>

          {/* Campaign Objective */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Campaign Objective</div>
            <p className={styles.pdocText}>
              {analysis!.campaign_objective || (
                <span className={styles.pdocEmpty}>Not specified.</span>
              )}
            </p>
          </div>

          {/* Objectives */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Objectives</div>
            <p className={styles.pdocText}>
              {analysis!.objectives || <span className={styles.pdocEmpty}>Not specified.</span>}
            </p>
          </div>

          {/* Current Situation */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Current Situation</div>
            <p className={styles.pdocText}>
              {analysis!.current_situation || (
                <span className={styles.pdocEmpty}>Not specified.</span>
              )}
            </p>
          </div>

          {/* Client Needs */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Client Needs</div>
            <p className={styles.pdocText}>
              {analysis!.client_needs || <span className={styles.pdocEmpty}>Not specified.</span>}
            </p>
          </div>

          {/* Key Challenges */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Key Challenges</div>
            <p className={styles.pdocText}>
              {analysis!.key_challenges || (
                <span className={styles.pdocEmpty}>None identified.</span>
              )}
            </p>
          </div>

          {/* Target Audience */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Target Audience</div>
            {analysis!.target_audience ? (
              <div className={styles.pdocAudienceGrid}>
                <div className={styles.pdocAudienceItem}>
                  <span className={styles.pdocAudienceLabel}>Primary</span>
                  <span className={styles.pdocAudienceValue}>
                    {analysis!.target_audience.primary_audience || '—'}
                  </span>
                </div>
                <div className={styles.pdocAudienceItem}>
                  <span className={styles.pdocAudienceLabel}>Age</span>
                  <span className={styles.pdocAudienceValue}>
                    {analysis!.target_audience.demographics?.age || '—'}
                  </span>
                </div>
                <div className={styles.pdocAudienceItem}>
                  <span className={styles.pdocAudienceLabel}>Location</span>
                  <span className={styles.pdocAudienceValue}>
                    {analysis!.target_audience.demographics?.location || '—'}
                  </span>
                </div>
                <div className={styles.pdocAudienceItem}>
                  <span className={styles.pdocAudienceLabel}>Psychographics</span>
                  <span className={styles.pdocAudienceValue}>
                    {analysis!.target_audience.psychographics || '—'}
                  </span>
                </div>
                <div className={styles.pdocAudienceItem}>
                  <span className={styles.pdocAudienceLabel}>Behaviour</span>
                  <span className={styles.pdocAudienceValue}>
                    {analysis!.target_audience.behavioral_traits || '—'}
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.pdocEmpty}>Not specified.</p>
            )}
          </div>

          {/* Strategy */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Our Strategy</div>
            <p className={styles.pdocText}>
              {analysis!.strategy || <span className={styles.pdocEmpty}>Not specified.</span>}
            </p>
          </div>

          {/* Marketing Message */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Marketing Message</div>
            <p className={styles.pdocText}>
              {analysis!.marketing_message || (
                <span className={styles.pdocEmpty}>Not specified.</span>
              )}
            </p>
          </div>

          {/* Pricing Packages */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Pricing Packages</div>
            {analysis!.pricing_tiers?.length > 0 ? (
              <div className={styles.pdocPricing}>
                {analysis!.pricing_tiers.map((tier, i) => (
                  <div key={i} className={styles.pdocTier}>
                    <div className={styles.pdocTierName}>{tier.package_name}</div>
                    <div className={styles.pdocTierPrice}>{tier.price}</div>
                    <div className={styles.pdocTierDesc}>{tier.description}</div>
                    {tier.influencer_count_range && (
                      <div className={styles.pdocTierMeta}>
                        {tier.influencer_count_range} influencers
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.pdocEmpty}>No pricing packages defined yet.</p>
            )}
          </div>

          {/* Package Inclusions */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Package Inclusions</div>
            {analysis!.package_inclusions?.length > 0 ? (
              <ul className={styles.pdocList}>
                {analysis!.package_inclusions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.pdocEmpty}>Not specified.</p>
            )}
          </div>

          {/* Value Adds */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Value Adds</div>
            {analysis!.value_adds?.length > 0 ? (
              <ul className={styles.pdocList}>
                {analysis!.value_adds.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.pdocEmpty}>Not specified.</p>
            )}
          </div>

          {/* Execution Plan */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Execution Plan</div>
            {analysis!.execution_plan?.length > 0 ? (
              <ul className={styles.pdocList}>
                {analysis!.execution_plan.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.pdocEmpty}>Not specified.</p>
            )}
          </div>

          {/* Key Success Metrics */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Key Success Metrics</div>
            {analysis!.key_success_metrics?.length > 0 ? (
              <ul className={styles.pdocList}>
                {analysis!.key_success_metrics.map((m, i) => (
                  <li key={i}>{typeof m === 'string' ? m : JSON.stringify(m)}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.pdocEmpty}>Not specified.</p>
            )}
          </div>

          {/* Expected Outcomes */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Expected Outcomes</div>
            <p className={styles.pdocText}>
              {analysis!.expected_outcomes || (
                <span className={styles.pdocEmpty}>Not specified.</span>
              )}
            </p>
          </div>

          {/* Next Steps */}
          <div className={styles.pdocSection}>
            <div className={styles.pdocSectionTitle}>Next Steps</div>
            <p className={styles.pdocText}>
              {analysis!.next_steps || <span className={styles.pdocEmpty}>Not specified.</span>}
            </p>
          </div>

          {/* Pricing Note */}
          {analysis!.pricing_note && (
            <div className={styles.pdocSection}>
              <div className={styles.pdocSectionTitle}>Pricing Note</div>
              <p className={styles.pdocText}>{analysis!.pricing_note}</p>
            </div>
          )}

          {/* Flag for review */}
          {analysis!.flag_for_review && (
            <div className={styles.pdocFlagBanner}>
              ⚠ Flagged for review{analysis!.flag_reason ? `: ${analysis!.flag_reason}` : ''}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.pdocFooter}>
          <span className={styles.pdocFooterBrand}>Social Jet · socialjet.sg</span>
          <span className={styles.pdocFooterDate}>
            Generated {formatShortDate(new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
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
    positive: '#22c55e',
    neutral: '#f59e0b',
    negative: '#ef4444',
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{meeting.invitee_name ?? 'Meeting'}</h2>
            <p className={styles.drawerSubtitle}>
              {formatDate(meeting.scheduled_at)}
              {meeting.meeting_type && (
                <span className={styles.drawerTypeBadge}>
                  {MEETING_TYPE_LABELS[meeting.meeting_type] ?? meeting.meeting_type}
                </span>
              )}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
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
          {activeSection === 'transcript' && (
            <>
              {!meeting.has_transcript ? (
                <div className={styles.drawerEmpty}>
                  {meeting.transcript_status === 'pending'
                    ? 'Transcript is being processed.'
                    : 'No transcript available.'}
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
                      <h4 className={styles.reportSectionTitle}>Objections</h4>
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

// ─── Book Meeting Modal ───────────────────────────────────────────────────────
function BookMeetingModal({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMeeting = useInstantMeeting();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [conflict, setConflict] = useState<AvailabilityCheckResponse | null>(null);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkAndSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!date || !time) return;
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
        void queryClient.invalidateQueries({ queryKey: ['lead-meetings', leadId] });
        setSuccess(true);
      }
    } finally {
      setChecking(false);
    }
  };

  const forceBook = async () => {
    const scheduled_at = new Date(`${date}T${time}`).toISOString();
    await createMeeting.mutateAsync({ lead_id: leadId, scheduled_at, duration_minutes: duration });
    void queryClient.invalidateQueries({ queryKey: ['lead-meetings', leadId] });
    setSuccess(true);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Book Meeting</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
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
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.successTitle}>Meeting Created!</p>
            <p className={styles.successSubtitle}>Zoom link sent to the lead.</p>
            <button className={styles.submitBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className={styles.modalForm} onSubmit={checkAndSubmit}>
            <div className={styles.modalFieldRow}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Date</label>
                <input
                  type="date"
                  className={styles.modalInput}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setConflict(null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Time</label>
                <input
                  type="time"
                  className={styles.modalInput}
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setConflict(null);
                  }}
                  required
                />
              </div>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Duration</label>
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
            {conflict && !conflict.available && (
              <div className={styles.conflictWarning}>
                <p className={styles.conflictTitle}>Time slot conflict</p>
                {conflict.conflicting_invitee_name && (
                  <p className={styles.conflictDesc}>
                    You already have a meeting with {conflict.conflicting_invitee_name} at this
                    time.
                  </p>
                )}
                {conflict.suggested_slots?.length > 0 && (
                  <div className={styles.suggestedSlots}>
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
                        {new Date(slot).toLocaleString('en-SG', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={styles.forceBtn}
                  onClick={forceBook}
                  disabled={createMeeting.isPending}
                >
                  Book anyway
                </button>
              </div>
            )}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={checking || createMeeting.isPending || !date || !time}
            >
              {checking
                ? 'Checking...'
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function LeadDetailView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'emails' | 'meetings' | 'proposals'>(
    'timeline'
  );
  const [transcriptMeeting, setTranscriptMeeting] = useState<Meeting | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const { data: lead, isLoading: leadLoading } = useQuery<Lead>({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.LEADS.DETAIL(leadId));
      return data;
    },
    staleTime: 30_000,
  });

  const { data: timelineData, isLoading: timelineLoading } = useLeadTimeline(leadId);

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery<{ meetings: Meeting[] }>({
    queryKey: ['lead-meetings', leadId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.MEETINGS.LIST, {
        params: { lead_id: leadId },
      });
      return data;
    },
    staleTime: 30_000,
  });

  const { data: inboxConv, isLoading: inboxLoading } = useQuery({
    queryKey: ['inbox', leadId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.INBOX.CONVERSATION(leadId));
      return data as import('@/types/inbox.types').InboxConversation;
    },
    enabled: activeTab === 'emails',
    staleTime: 15_000,
    refetchInterval: activeTab === 'emails' ? 15_000 : false,
  });

  const initials = lead?.name
    ? lead.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const statusColor = STATUS_COLORS[lead?.status ?? ''] ?? '#6b7280';
  const sourceLabel = SOURCE_LABELS[lead?.source ?? ''] ?? lead?.source ?? 'Unknown';

  const meetingsWithTranscript = meetingsData?.meetings?.filter((m) => m.has_transcript) ?? [];
  const pendingMeetings =
    meetingsData?.meetings?.filter((m) => m.meeting_status === 'upcoming') ?? [];

  const tabs = [
    { key: 'timeline' as const, label: 'Timeline' },
    { key: 'emails' as const, label: 'Chat' },
    { key: 'meetings' as const, label: 'Meetings', badge: pendingMeetings.length },
    { key: 'proposals' as const, label: 'Proposals', badge: meetingsWithTranscript.length },
  ];

  if (leadLoading)
    return (
      <div className={styles.root}>
        <div className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <BackIcon /> Back to Leads
          </button>
        </div>
        <div className={styles.headerSkeleton} />
      </div>
    );

  if (!lead) return <div className={styles.empty}>Lead not found.</div>;

  return (
    <div className={styles.root}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <BackIcon /> Back to Leads
        </button>
      </div>

      <div className={styles.pageLayout}>
        {/* ── LEFT SIDEBAR ── */}
        <aside className={styles.sidebar}>
          {/* Hero */}
          <div className={styles.sidebarHero}>
            <div className={styles.sidebarAvatar}>{initials}</div>
            <p className={styles.sidebarName}>{lead.name}</p>
            {lead.company && <p className={styles.sidebarCompany}>{lead.company}</p>}
            <div className={styles.sidebarBadges}>
              <span
                className={styles.statusBadge}
                style={{
                  background: `${statusColor}25`,
                  color: '#fff',
                  border: `1px solid rgba(255,255,255,0.3)`,
                }}
              >
                {lead.status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className={styles.sourceBadge}>{sourceLabel}</span>
            </div>
          </div>

          <div className={styles.sidebarBody}>
            {/* Contact info */}
            <div className={styles.sidebarContacts}>
              {lead.email && (
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <MailIcon />
                  </div>
                  <span className={styles.contactText}>{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <PhoneIcon />
                  </div>
                  <span className={styles.contactText}>{lead.phone}</span>
                </div>
              )}
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <CalendarIcon />
                </div>
                <span className={styles.contactText}>Added {formatShortDate(lead.created_at)}</span>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <VideoIcon />
                </div>
                <span className={styles.contactText}>{daysSince(lead.created_at)}d in system</span>
              </div>
            </div>

            <div className={styles.sidebarDivider} />

            {/* Stats */}
            <div className={styles.sidebarStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{meetingsData?.meetings?.length ?? '—'}</span>
                <span className={styles.statLabel}>Meetings</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{meetingsWithTranscript.length}</span>
                <span className={styles.statLabel}>Analysable</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{daysSince(lead.created_at)}</span>
                <span className={styles.statLabel}>Days Active</span>
              </div>
              <div className={styles.statCard}>
                <span
                  className={styles.statValue}
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: meetingsWithTranscript.length > 0 ? '#22c55e' : 'inherit',
                  }}
                >
                  {meetingsWithTranscript.length > 0 ? 'Ready' : 'No transcript'}
                </span>
                <span className={styles.statLabel}>Analysis</span>
              </div>
            </div>

            <div className={styles.sidebarDivider} />

            {/* Journey */}
            <div className={styles.sidebarJourney}>
              <p className={styles.sidebarJourneyTitle}>Lead Journey</p>
              <JourneyStepper status={lead.status ?? 'new'} />
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className={styles.main}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`${tab.key}-tab`}
                className={cn(styles.tab, activeTab === tab.key && styles.tabActive)}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {'badge' in tab && (tab.badge ?? 0) > 0 && (
                  <span className={styles.tabBadge}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Timeline ── */}
          {activeTab === 'timeline' && (
            <div className={styles.panel}>
              {timelineLoading ? (
                <div className={styles.skeletonList}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow} />
                  ))}
                </div>
              ) : !timelineData?.timeline?.length ? (
                <div className={styles.empty}>No timeline events yet.</div>
              ) : (
                <div className={styles.timeline}>
                  {timelineData.timeline.map((event) => (
                    <TimelineRow key={event.event_id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Chat ── */}
          {activeTab === 'emails' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Chat History</h3>
                <button
                  className={cn(styles.actionBtn, styles.actionBtnPrimary)}
                  onClick={() => router.push(`/sales/inbox?lead=${leadId}`)}
                >
                  <MailIcon /> Reply in Inbox
                </button>
              </div>
              {inboxLoading ? (
                <div className={styles.skeletonList}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow} />
                  ))}
                </div>
              ) : !inboxConv?.messages?.length ? (
                <div className={styles.empty}>No messages yet.</div>
              ) : (
                <div className={styles.chatHistory}>
                  {inboxConv.messages.map((msg) => {
                    // direction is source of truth; fallback: only 'assistant' is outbound
                    const isOut = msg.direction
                      ? msg.direction === 'outbound'
                      : msg.sender === 'assistant';
                    const isWA = msg.channel === 'whatsapp';
                    return (
                      <div
                        key={msg.message_id}
                        className={cn(
                          styles.chatBubbleRow,
                          isOut ? styles.chatBubbleRowOut : styles.chatBubbleRowIn
                        )}
                      >
                        {/* Lead avatar on inbound */}
                        {!isOut && (
                          <div className={styles.chatAvatar} title={lead.name}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.chatBubbleGroup}>
                          {!isOut && <span className={styles.chatSenderLabel}>{lead.name}</span>}
                          <div
                            className={cn(
                              styles.chatBubble,
                              isOut ? styles.chatBubbleOut : styles.chatBubbleIn
                            )}
                          >
                            {msg.subject && <p className={styles.chatSubject}>{msg.subject}</p>}
                            <p className={styles.chatText}>{msg.text}</p>
                            <div className={styles.chatMeta}>
                              {msg.is_ai && <span className={styles.aiBadge}>AI</span>}
                              <span className={styles.chatChannel}>{isWA ? '📱' : '✉️'}</span>
                              <span className={styles.chatTime}>
                                {new Date(msg.timestamp).toLocaleTimeString('en-SG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Right spacer so inbound bubbles don't stretch too wide */}
                        {!isOut && <div className={styles.chatAvatarSpacer} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Meetings ── */}
          {activeTab === 'meetings' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Meetings</h3>
                <button
                  className={cn(styles.actionBtn, styles.actionBtnPrimary)}
                  onClick={() => setShowBookModal(true)}
                >
                  <CalendarIcon /> Book New
                </button>
              </div>
              {meetingsLoading ? (
                <div className={styles.skeletonList}>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow} />
                  ))}
                </div>
              ) : !meetingsData?.meetings?.length ? (
                <div className={styles.empty}>No meetings booked yet.</div>
              ) : (
                <div className={styles.meetingList}>
                  {meetingsData.meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.meeting_id}
                      meeting={meeting}
                      onViewTranscript={setTranscriptMeeting}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Proposals / Intelligence Analysis ── */}
          {activeTab === 'proposals' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Proposals</h3>
                {meetingsWithTranscript.length > 0 && (
                  <span style={{ fontSize: 'var(--text-xs)', color: '#16a34a', fontWeight: 600 }}>
                    ✓ {meetingsWithTranscript.length} meeting
                    {meetingsWithTranscript.length > 1 ? 's' : ''} ready for analysis
                  </span>
                )}
              </div>
              {meetingsLoading ? (
                <div className={styles.skeletonList}>
                  {Array.from({ length: 1 }).map((_, i) => (
                    <div key={i} className={styles.skeletonRow} />
                  ))}
                </div>
              ) : !meetingsData?.meetings?.length ? (
                <div className={styles.empty}>
                  No meetings yet. Book a meeting to generate a proposal.
                </div>
              ) : (
                <div className={styles.proposalList}>
                  {meetingsData.meetings.map((meeting) => (
                    <MeetingAnalysisCard key={meeting.meeting_id} meeting={meeting} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {transcriptMeeting && (
        <TranscriptDrawer meeting={transcriptMeeting} onClose={() => setTranscriptMeeting(null)} />
      )}
      {showBookModal && (
        <BookMeetingModal leadId={leadId} onClose={() => setShowBookModal(false)} />
      )}
    </div>
  );
}
