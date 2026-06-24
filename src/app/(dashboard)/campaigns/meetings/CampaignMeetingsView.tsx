'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styles from './CampaignMeetingsView.module.css';
import { useOnboardingCalls } from '@/hooks/useMeetings';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { cn } from '@/lib/utils';
import type { OnboardingCall } from '@/types/meeting.types';
import { MEETING_TYPE_LABELS } from '@/types/meeting.types';

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Transcript / AI Report Drawer ──────────────────────────────────────────────
function TranscriptDrawer({ meeting, onClose }: { meeting: OnboardingCall; onClose: () => void }) {
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
    enabled: meeting.has_transcript,
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
                  {transcriptData?.raw_transcript ??
                    meeting.transcript_content ??
                    'Transcript not found.'}
                </pre>
              )}
            </>
          )}

          {/* Report section */}
          {activeSection === 'report' && (
            <>
              {!meeting.has_transcript ? (
                <div className={styles.drawerEmpty}>
                  No AI report yet. A report is generated once the transcript is ready.
                </div>
              ) : reportLoading ? (
                <div className={styles.drawerSkeleton} />
              ) : !reportData ? (
                <div className={styles.drawerEmpty}>
                  No AI report yet. Report is being generated.
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

                  {reportData.summary && (
                    <div className={styles.reportSection}>
                      <h4 className={styles.reportSectionTitle}>Summary</h4>
                      <p className={styles.reportSectionBody}>{reportData.summary}</p>
                    </div>
                  )}

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

// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({
  meeting,
  onViewTranscript,
}: {
  meeting: OnboardingCall;
  onViewTranscript: (m: OnboardingCall) => void;
}) {
  const router = useRouter();
  // has_transcript means the meeting happened even if status wasn't updated to 'done' yet
  const isPast = meeting.meeting_status === 'done' || meeting.has_transcript;
  const isCanceled = meeting.meeting_status === 'canceled';
  const isUpcoming = meeting.meeting_status === 'upcoming' && !meeting.has_transcript;
  const meetingNumLabel = meeting.meeting_number
    ? `${['1st', '2nd', '3rd', '4th', '5th'][meeting.meeting_number - 1] ?? `${meeting.meeting_number}th`} Meeting`
    : null;

  return (
    <div className={cn(styles.card, isPast && styles.cardPast, isCanceled && styles.cardCanceled)}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfoBlock}>
          <p className={styles.cardName}>{meeting.invitee_name}</p>
          <p className={styles.cardEmail}>{meeting.invitee_email}</p>
          {meeting.brand_name && <p className={styles.cardBrand}>{meeting.brand_name}</p>}
        </div>
        <div className={styles.cardBadges}>
          <span className={cn(styles.sourceBadge, styles.sourceOnboarding)}>
            <CalendarIcon />
            Onboarding
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
            {isPast ? 'done' : meeting.meeting_status}
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
              {MEETING_TYPE_LABELS[meeting.meeting_type] ??
                meeting.event_name ??
                meeting.meeting_type}
            </span>
          )}
          {meeting.lead_id && (
            <button
              className={styles.leadLinkTag}
              onClick={() => router.push(`/campaigns/leads/${meeting.lead_id}`)}
            >
              <LeadIcon /> View Lead
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
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

// ─── Main View ────────────────────────────────────────────────────────────────
export function CampaignMeetingsView() {
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [transcriptMeeting, setTranscriptMeeting] = useState<OnboardingCall | null>(null);

  const { data, isLoading, isError } = useOnboardingCalls({ page_size: 100 });

  const meetings = useMemo(() => data?.meetings ?? [], [data]);

  const { upcoming, past } = useMemo(() => {
    const up: OnboardingCall[] = [];
    const pa: OnboardingCall[] = [];
    for (const m of meetings) {
      const isPast = m.meeting_status === 'done' || m.has_transcript;
      if (isPast) pa.push(m);
      else if (m.meeting_status === 'upcoming') up.push(m);
    }
    return { upcoming: up, past: pa };
  }, [meetings]);

  const tabs = [
    { key: 'upcoming' as const, label: 'Upcoming', count: upcoming.length },
    { key: 'past' as const, label: 'Past', count: past.length },
    { key: 'all' as const, label: 'All Meetings', count: meetings.length },
  ];

  const currentList = tab === 'upcoming' ? upcoming : tab === 'past' ? past : meetings;

  return (
    <div className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Meetings</h1>
          <p className={styles.pageSubtitle}>Onboarding calls — transcripts and AI reports</p>
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.cardSkeleton} />)
        ) : isError ? (
          <div className={styles.error}>Couldn&apos;t load meetings. Please try again.</div>
        ) : currentList.length === 0 ? (
          <div className={styles.empty}>
            <p>No {tab === 'all' ? '' : tab} meetings.</p>
          </div>
        ) : (
          currentList.map((m) => (
            <MeetingCard key={m.meeting_id} meeting={m} onViewTranscript={setTranscriptMeeting} />
          ))
        )}
      </div>

      {transcriptMeeting && (
        <TranscriptDrawer meeting={transcriptMeeting} onClose={() => setTranscriptMeeting(null)} />
      )}
    </div>
  );
}
