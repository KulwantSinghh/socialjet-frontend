'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './StagePanel.module.css';
import { ProposalEditor } from '@/components/shared/ProposalEditor';
import { InfluencerDiscovery } from '@/components/campaigns/InfluencerDiscovery';
import type { Editor } from '@tiptap/react';
import {
  useQuestionnaire,
  useCampaignMeeting,
  useCampaignDocuments,
  useKolBrief,
  useLeadInfluencers,
  useLeadContent,
  useCampaignLeadDetail,
  useCampaignManagers,
  CAMPAIGN_LEADS_KEY,
} from '@/hooks/useCampaignLeads';
import { campaignsService } from '@/services/campaigns.service';
import { useQueryClient } from '@tanstack/react-query';
import type {
  CampaignLeadStage,
  OnboardingDocument,
  KolBriefDocument,
} from '@/types/campaign.types';

// ─── Lead Stage (unassigned / assigned) ──────────────────────────────────────
function LeadStage({ leadId }: { leadId: string }) {
  const { data: lead, isLoading } = useCampaignLeadDetail(leadId);
  const { data: managers } = useCampaignManagers();

  // Backend only stores assigned_cm_id — enrich with name/email from managers list
  const assignedCmId = (lead?.assignedTo as { id?: string } | undefined)?.id;
  const enrichedCm = assignedCmId
    ? (managers?.find((m) => m.id === assignedCmId) ?? lead?.assignedTo)
    : undefined;

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  if (isLoading) {
    return (
      <div className={styles.leadCard}>
        {[180, 140, 120, 160].map((w, i) => (
          <div
            key={i}
            className={styles.shimmer}
            style={{ height: 16, width: w, marginBottom: 12 }}
          />
        ))}
      </div>
    );
  }

  if (!lead) return null;

  const rows: { label: string; value: string | undefined }[] = [
    { label: 'Company', value: lead.clientCompany },
    { label: 'Email', value: lead.clientEmail },
    { label: 'Source', value: lead.source },
    { label: 'Priority', value: lead.priority },
    {
      label: 'Created',
      value: lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : undefined,
    },
  ];

  return (
    <div className={styles.leadCard}>
      {/* Client header */}
      <div className={styles.leadCardHeader}>
        <div className={styles.leadCardAvatar}>{getInitials(lead.clientName)}</div>
        <div>
          <div className={styles.leadCardName}>{lead.clientName}</div>
          <div className={styles.leadCardCompany}>{lead.clientCompany}</div>
        </div>
        <span className={`${styles.leadCardBadge} ${styles[`priority_${lead.priority}`]}`}>
          {lead.priority}
        </span>
      </div>

      {/* Info rows */}
      <div className={styles.leadCardRows}>
        {rows.map(({ label, value }) =>
          value ? (
            <div key={label} className={styles.leadCardRow}>
              <span className={styles.leadCardRowLabel}>{label}</span>
              <span className={styles.leadCardRowValue}>{value}</span>
            </div>
          ) : null
        )}
      </div>

      {/* Assignment status */}
      <div className={styles.leadCardSection}>
        <div className={styles.leadCardSectionTitle}>Campaign Manager</div>
        {enrichedCm ? (
          <div className={styles.cmAssigned}>
            <div className={styles.cmAssignedAvatar}>
              {getInitials((enrichedCm as { name: string }).name || 'CM')}
            </div>
            <div>
              <div className={styles.cmAssignedName}>
                {(enrichedCm as { name: string }).name || 'Campaign Manager'}
              </div>
              <div className={styles.cmAssignedEmail}>
                {(enrichedCm as { email: string }).email}
              </div>
            </div>
            <span className={styles.cmAssignedBadge}>Assigned</span>
          </div>
        ) : (
          <div className={styles.cmUnassigned}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            No Campaign Manager assigned yet — use <strong>Assign CM</strong> in the top bar
          </div>
        )}
      </div>

      {/* Next step hint */}
      {!enrichedCm && (
        <div className={styles.leadCardNext}>
          <strong>Next step:</strong> Assign a Campaign Manager to begin the onboarding workflow.
        </div>
      )}
      {enrichedCm && (
        <div className={styles.leadCardNext}>
          <strong>Next step:</strong> Click <em>Questionnaire Sent</em> in the timeline to send the
          client questionnaire.
        </div>
      )}
    </div>
  );
}

// ─── Questionnaire branded HTML builder ───────────────────────────────────────
function buildQuestionnaireHtml(
  questions: { question: string }[],
  lead: { clientName: string; clientCompany: string; clientEmail: string },
  sentDate: string
): string {
  const rows = questions
    .map(
      (q, i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
          <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Q${i + 1}</div>
          <div style="font-size:15px;color:#1a1a1a;font-weight:500;">${q.question}</div>
          <div style="margin-top:10px;background:#f9f9f9;border:1px solid #e5e5e5;border-radius:6px;padding:12px;min-height:40px;color:#999;font-size:13px;">(Your answer here)</div>
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 40px;">
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">SocialJet</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">Go Viral With Influencers</div>
            <div style="margin-top:20px;font-size:18px;font-weight:600;color:#ffffff;">Campaign Questionnaire</div>
            <div style="margin-top:4px;font-size:13px;color:rgba(255,255,255,0.8);">Sent on ${sentDate}</div>
          </td>
        </tr>

        <!-- Client info -->
        <tr>
          <td style="padding:28px 40px 0;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:12px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Prepared for</div>
            <div style="font-size:16px;font-weight:600;color:#1a1a1a;">${lead.clientName}</div>
            <div style="font-size:13px;color:#666;margin-top:2px;">${lead.clientCompany} &nbsp;·&nbsp; ${lead.clientEmail}</div>
            <div style="margin-top:16px;font-size:13px;color:#555;line-height:1.6;padding-bottom:20px;">
              Hi ${lead.clientName},<br/><br/>
              To help us design the perfect influencer campaign for <strong>${lead.clientCompany}</strong>, please fill in the questionnaire below and reply to this email with your answers.
            </div>
          </td>
        </tr>

        <!-- Questions -->
        <tr>
          <td style="padding:0 40px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;">
            <div style="font-size:12px;color:#999;text-align:center;">
              SocialJet · Influencer Marketing Platform<br/>
              Reply to this email with your answers or contact your Campaign Manager directly.
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Default onboarding questions ────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
  {
    id: 'dq1',
    question: 'Website / Instagram / Campaign Information',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq2',
    question: 'Define the marketing objectives / goals you are trying to hit with this campaign',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq3',
    question: 'Briefly describe your Target Audience / Customer Persona',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq4',
    question: 'Values / Benefits of the products / services',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq5',
    question: 'What is your marketing message, or what would you like to convey?',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq6',
    question: 'What sets the business apart from competitors in the industry?',
    answer: undefined,
    type: 'text',
  },
  { id: 'dq7', question: 'Pain points of current customers', answer: undefined, type: 'text' },
  {
    id: 'dq8',
    question: 'Is there a preferred age range for the Influencers of this campaign?',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq9',
    question: 'Can you briefly describe an ideal Influencer for this campaign?',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq10',
    question: 'Do you have any examples of KOLs you would like to share or keen to explore?',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq11',
    question: 'Are there any no-gos for your Influencers? (e.g. no tattoos / coloured hair etc)',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq12',
    question:
      'Is there an offer? (free trial / promo / etc), and what is the target price? Also — where can Influencers lead the CTA? (website / link)',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq13',
    question:
      'What type of content resonates the most with your target audience? (e.g. unboxing, tutorial, vlog)',
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq14',
    question:
      "Is there a specific publishing date / timeline for the Influencers' content to go live?",
    answer: undefined,
    type: 'text',
  },
  {
    id: 'dq15',
    question:
      'Optional: Are we planning to boost after the campaign? (e.g. right away, a week after the first KOL posts, only low/high performing ones)',
    answer: undefined,
    type: 'text',
  },
  { id: 'dq16', question: 'Comments from Client', answer: undefined, type: 'text' },
  { id: 'dq17', question: 'Questions from Client', answer: undefined, type: 'text' },
  { id: 'dq18', question: 'SJ Action Plan', answer: undefined, type: 'text' },
];

// ─── Questionnaire Stage ──────────────────────────────────────────────────────
function QuestionnaireStage({ leadId }: { leadId: string }) {
  const { data: q, isLoading } = useQuestionnaire(leadId);
  const { data: lead } = useCampaignLeadDetail(leadId);
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<
    { question_id: string; question: string; answer?: string; type: string }[]
  >([]);
  const [sending, setSending] = useState(false);
  const [markingReceived, setMarkingReceived] = useState(false);

  const isSent = !!q?.sentAt;
  const isReceived = !!q?.receivedAt;

  function startEdit() {
    if (editedQuestions.length > 0) {
      setEditing(true);
      return;
    }
    setEditedQuestions(
      DEFAULT_QUESTIONS.map((item) => ({
        question_id: item.id,
        question: item.question,
        answer: item.answer,
        type: item.type,
      }))
    );
    setEditing(true);
  }

  async function saveEdits() {
    await campaignsService.updateQuestionnaire(leadId, editedQuestions as never);
    qc.invalidateQueries({ queryKey: ['campaign-questionnaire', leadId] });
    setEditing(false);
  }

  async function handleSend() {
    if (!lead) return;
    const activeQuestions = DEFAULT_QUESTIONS;
    setSending(true);
    try {
      const sentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const html = buildQuestionnaireHtml(
        activeQuestions.map((item) => ({ question: item.question })),
        {
          clientName: lead.clientName,
          clientCompany: lead.clientCompany,
          clientEmail: lead.clientEmail,
        },
        sentDate
      );
      await campaignsService.sendQuestionnaire(leadId, html);
      qc.invalidateQueries({ queryKey: ['campaign-questionnaire', leadId] });
      qc.invalidateQueries({ queryKey: [CAMPAIGN_LEADS_KEY, leadId] });
    } finally {
      setSending(false);
    }
  }

  async function handleMarkReceived() {
    setMarkingReceived(true);
    try {
      await campaignsService.markQuestionnaireReceived(leadId);
      qc.invalidateQueries({ queryKey: ['campaign-questionnaire', leadId] });
      qc.invalidateQueries({ queryKey: [CAMPAIGN_LEADS_KEY, leadId] });
    } finally {
      setMarkingReceived(false);
    }
  }

  if (isLoading) return <StageSkeleton />;

  // Questions are always defined in the frontend template.
  // Backend stores only sent_at / received_at timestamps — not the questions.
  const questions = DEFAULT_QUESTIONS;

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Questionnaire</h2>
        <div className={styles.stageHeaderActions}>
          {isReceived ? (
            <span className={`${styles.statusBadge} ${styles.statusReceived}`}>✓ Received</span>
          ) : isSent ? (
            <>
              <span className={`${styles.statusBadge} ${styles.statusSent}`}>Sent to Client</span>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleMarkReceived}
                disabled={markingReceived}
              >
                {markingReceived ? 'Marking…' : '✓ Mark as Received'}
              </button>
            </>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Draft</span>
          )}
          {!editing && (
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={startEdit}>
              ✏ Edit Questions
            </button>
          )}
          {!isSent && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? 'Sending…' : '✉ Send to Client'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.stageBody}>
        {/* Sent metadata */}
        {isSent && (
          <div className={styles.sentMeta}>
            <span>
              Sent on{' '}
              {new Date(q!.sentAt!).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {isReceived && (
              <span className={styles.receivedDot}>
                · Responses received{' '}
                {new Date(q!.receivedAt!).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div className={styles.editBlock}>
            <p className={styles.editHint}>
              Edit the questions below. The client will see these exact questions in the email.
            </p>
            {editedQuestions.map((item, i) => (
              <div key={item.question_id} className={styles.questionItem}>
                <label className={styles.questionLabel}>Question {i + 1}</label>
                <input
                  className={styles.questionEditInput}
                  value={item.question}
                  onChange={(e) => {
                    const copy = [...editedQuestions];
                    copy[i] = { ...copy[i], question: e.target.value };
                    setEditedQuestions(copy);
                  }}
                />
              </div>
            ))}
            <div className={styles.editActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveEdits}>
                Save Questions
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Branded email preview */}
        {!editing && (
          <>
            {!isSent && (
              <div className={styles.previewLabel}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Email preview — this is exactly what the client will receive
              </div>
            )}
            <div className={styles.qEmailPreview}>
              {/* Branded header */}
              <div className={styles.qEmailHeader}>
                <div className={styles.qEmailBrand}>
                  <span className={styles.qEmailLogo}>SocialJet</span>
                  <span className={styles.qEmailTagline}>Go Viral With Influencers</span>
                </div>
                <div className={styles.qEmailTitle}>Campaign Questionnaire</div>
                {lead && (
                  <div className={styles.qEmailMeta}>
                    Prepared for {lead.clientName} · {lead.clientCompany}
                  </div>
                )}
              </div>

              {/* Greeting */}
              {lead && (
                <div className={styles.qEmailGreeting}>
                  Hi <strong>{lead.clientName}</strong>,<br />
                  To design the perfect influencer campaign for{' '}
                  <strong>{lead.clientCompany}</strong>, please answer the questions below and reply
                  to this email.
                </div>
              )}

              {/* Questions */}
              <div className={styles.qEmailQuestions}>
                {questions.map((item, i) => (
                  <div key={item.id} className={styles.qEmailQuestion}>
                    <div className={styles.qEmailQNum}>Q{i + 1}</div>
                    <div className={styles.qEmailQBody}>
                      <div className={styles.qEmailQText}>{item.question}</div>
                      {isReceived ? (
                        <div
                          className={`${styles.qEmailAnswer} ${!item.answer ? styles.qEmailAnswerEmpty : ''}`}
                        >
                          {item.answer ?? 'No answer provided'}
                        </div>
                      ) : isSent ? (
                        <div className={styles.qEmailAnswerPending}>Awaiting client response…</div>
                      ) : (
                        <div className={styles.qEmailAnswerPlaceholder}>
                          (Client will fill this in)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className={styles.qEmailFooter}>
                SocialJet · Influencer Marketing Platform · Reply to this email with your answers
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Meeting Stage ────────────────────────────────────────────────────────────
function MeetingStage({ leadId }: { leadId: string }) {
  const { data: meeting, isLoading } = useCampaignMeeting(leadId);
  const { data: lead } = useCampaignLeadDetail(leadId);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [emails, setEmails] = useState('');
  const [booking, setBooking] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'report'>('transcript');
  const qc = useQueryClient();

  // Auto-fill client email when booking form opens
  function openBooking() {
    setEmails(lead?.clientEmail ?? '');
    setShowSchedule(true);
  }

  async function handleSchedule() {
    if (!scheduledAt) return;
    setBooking(true);
    try {
      await campaignsService.scheduleMeeting(leadId, {
        scheduledAt,
        inviteEmails: emails
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean),
        durationMinutes: Number(duration),
      });
      qc.invalidateQueries({ queryKey: ['campaign-meeting', leadId] });
      qc.invalidateQueries({ queryKey: ['campaign-leads', leadId] });
      setShowSchedule(false);
    } finally {
      setBooking(false);
    }
  }

  async function fetchTranscript() {
    if (!meeting?.id) return;
    setLoadingTranscript(true);
    try {
      const data = await import('@/services/api/client').then(({ apiClient }) =>
        apiClient.get(`/meetings/${meeting.id}/transcript`).then((r) => r.data)
      );
      setTranscript(
        (data as { raw_transcript?: string; transcript?: string }).raw_transcript ??
          (data as { transcript?: string }).transcript ??
          'No transcript content.'
      );
    } catch {
      setTranscript('Transcript not available yet.');
    } finally {
      setLoadingTranscript(false);
    }
  }

  async function fetchReport() {
    if (!meeting?.id) return;
    setLoadingReport(true);
    try {
      const data = await import('@/services/api/client').then(({ apiClient }) =>
        apiClient.post(`/meetings/${meeting.id}/report`).then((r) => r.data)
      );
      setReport(data as Record<string, unknown>);
    } catch {
      setReport({ error: 'Report not available yet. Transcript may still be processing.' });
    } finally {
      setLoadingReport(false);
    }
  }

  async function openSidebar() {
    setSidebarOpen(true);
    setActiveTab('transcript');
    // Auto-fetch both in parallel when sidebar opens
    if (meeting?.id) {
      if (!transcript) {
        setLoadingTranscript(true);
        import('@/services/api/client')
          .then(({ apiClient }) =>
            apiClient.get(`/meetings/${meeting.id}/transcript`).then((r) => r.data)
          )
          .then((data) => {
            const t =
              (data as { raw_transcript?: string; transcript?: string }).raw_transcript ??
              (data as { transcript?: string }).transcript ??
              '';
            setTranscript(t || null);
            // Auto-fetch report after transcript
            if (t && !report) {
              setLoadingReport(true);
              import('@/services/api/client')
                .then(({ apiClient }) =>
                  apiClient.post(`/meetings/${meeting.id}/report`).then((r) => r.data)
                )
                .then((rd) => setReport(rd as Record<string, unknown>))
                .catch(() => setReport({ error: 'Report not available yet.' }))
                .finally(() => setLoadingReport(false));
            }
          })
          .catch(() => setTranscript(null))
          .finally(() => setLoadingTranscript(false));
      } else if (!report) {
        fetchReport();
      }
    }
  }

  if (isLoading) return <StageSkeleton />;

  const isBooked = !!meeting?.id && ['upcoming', 'scheduled'].includes(meeting.status ?? '');
  const isDone = ['completed', 'done'].includes(meeting?.status ?? '');
  const hasInsights = isBooked || isDone;

  return (
    <div className={styles.meetingLayout}>
      {/* ── Main content ── */}
      <div className={styles.meetingMain}>
        <div className={styles.stageHeader}>
          <h2 className={styles.stageTitle}>Meeting</h2>
          <div className={styles.stageHeaderActions}>
            {isDone ? (
              <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>✓ Completed</span>
            ) : isBooked ? (
              <span className={`${styles.statusBadge} ${styles.statusScheduled}`}>Booked</span>
            ) : (
              <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Not Scheduled</span>
            )}
            {hasInsights && (
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={openSidebar}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Transcript & Report
              </button>
            )}
            {!isBooked && !isDone && (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openBooking}>
                Book Meeting
              </button>
            )}
          </div>
        </div>

        <div className={styles.stageBody}>
          {/* Booked meeting details */}
          {(isBooked || isDone) && meeting && (
            <div className={styles.meetingCard}>
              {meeting.zoomLink && !isDone && (
                <a
                  href={meeting.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.joinMeetingBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                  Join Onboarding Meeting
                </a>
              )}
              <div className={styles.meetingDetails}>
                {meeting.scheduledAt && (
                  <div className={styles.meetingRow}>
                    <span className={styles.meetingLabel}>Date & Time</span>
                    <span className={styles.meetingValue}>
                      {new Date(meeting.scheduledAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                <div className={styles.meetingRow}>
                  <span className={styles.meetingLabel}>Duration</span>
                  <span className={styles.meetingValue}>{meeting.duration ?? 60} min</span>
                </div>
                <div className={styles.meetingRow}>
                  <span className={styles.meetingLabel}>Status</span>
                  <span className={styles.meetingStatusPill}>{meeting.status ?? 'upcoming'}</span>
                </div>
                <div className={styles.meetingRow}>
                  <span className={styles.meetingLabel}>Type</span>
                  <span className={styles.meetingValue}>Onboarding Call</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking form */}
          {showSchedule && (
            <div className={styles.meetingCard}>
              <h3 className={styles.meetingFormTitle}>Book a Meeting</h3>
              <div className={styles.meetingForm}>
                <div className={styles.meetingFormRow}>
                  <label className={styles.meetingLabel}>Date & Time</label>
                  <input
                    type="datetime-local"
                    className={styles.meetingInput}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
                <div className={styles.meetingFormRow}>
                  <label className={styles.meetingLabel}>Duration (minutes)</label>
                  <select
                    className={styles.meetingInput}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
                <div className={styles.meetingFormRow}>
                  <label className={styles.meetingLabel}>Invite Emails</label>
                  <input
                    type="text"
                    className={styles.meetingInput}
                    placeholder="email@example.com, another@example.com"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                  />
                  <span className={styles.meetingInputHint}>
                    Client email pre-filled — add more if needed
                  </span>
                </div>
                <div className={styles.meetingFormActions}>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleSchedule}
                    disabled={!scheduledAt || booking}
                  >
                    {booking ? 'Booking…' : 'Confirm & Book'}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => setShowSchedule(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      {sidebarOpen && (
        <div className={styles.insightsSidebar}>
          {/* Header */}
          <div className={styles.sidebarHeader}>
            <div>
              <div className={styles.sidebarTitle}>Meeting Insights</div>
              <div className={styles.sidebarSubtitle}>Transcript &amp; AI analysis</div>
            </div>
            <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.sidebarTabBar}>
            <button
              className={`${styles.sidebarTab} ${activeTab === 'transcript' ? styles.sidebarTabActive : ''}`}
              onClick={() => setActiveTab('transcript')}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Transcript
              {loadingTranscript && <span className={styles.tabSpinner} />}
              {transcript && !loadingTranscript && <span className={styles.tabDot} />}
            </button>
            <button
              className={`${styles.sidebarTab} ${activeTab === 'report' ? styles.sidebarTabActive : ''}`}
              onClick={() => setActiveTab('report')}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              AI Report
              {loadingReport && <span className={styles.tabSpinner} />}
              {report && !loadingReport && !('error' in report) && (
                <span className={styles.tabDot} />
              )}
            </button>
          </div>

          {/* Transcript tab */}
          {activeTab === 'transcript' && (
            <div className={styles.sidebarContent}>
              {loadingTranscript ? (
                <div className={styles.sidebarLoading}>
                  <div className={styles.sidebarSpinner} />
                  <span>Fetching transcript…</span>
                </div>
              ) : transcript ? (
                <>
                  <div className={styles.sidebarContentActions}>
                    <span className={styles.sidebarHint}>Zoom-processed recording</span>
                    <button
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                      onClick={fetchTranscript}
                    >
                      ↻ Refresh
                    </button>
                  </div>
                  <pre className={styles.transcriptBox}>{transcript}</pre>
                </>
              ) : (
                <div className={styles.sidebarEmpty}>
                  <div className={styles.sidebarEmptyIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className={styles.sidebarEmptyTitle}>No transcript yet</div>
                  <div className={styles.sidebarEmptyText}>
                    The transcript is generated automatically after the meeting ends and Zoom
                    processes the recording.
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={fetchTranscript}
                  >
                    Fetch Transcript
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Report tab */}
          {activeTab === 'report' && (
            <div className={styles.sidebarContent}>
              {loadingReport ? (
                <div className={styles.sidebarLoading}>
                  <div className={styles.sidebarSpinner} />
                  <span>Generating AI report…</span>
                </div>
              ) : report && !('error' in report) ? (
                <>
                  <div className={styles.sidebarContentActions}>
                    <span className={styles.sidebarHint}>AI-generated from transcript</span>
                    <button
                      className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                      onClick={fetchReport}
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                  <div className={styles.aiReportBody}>
                    {/* Summary — full width card */}
                    {!!report.summary && (
                      <div className={styles.aiReportSummary}>
                        <div className={styles.aiReportSectionLabel}>Summary</div>
                        <p className={styles.aiReportSummaryText}>{String(report.summary)}</p>
                      </div>
                    )}
                    {/* Key points */}
                    {Array.isArray(report.key_points) && report.key_points.length > 0 && (
                      <div className={styles.aiReportSection}>
                        <div className={styles.aiReportSectionLabel}>Key Points</div>
                        <ul className={styles.aiReportList}>
                          {(report.key_points as string[]).map((pt, i) => (
                            <li key={i} className={styles.aiReportListItem}>
                              <span className={styles.aiReportBullet} />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Next steps */}
                    {Array.isArray(report.next_steps) && report.next_steps.length > 0 && (
                      <div className={styles.aiReportSection}>
                        <div className={styles.aiReportSectionLabel}>Next Steps</div>
                        <ul className={styles.aiReportList}>
                          {(report.next_steps as string[]).map((s, i) => (
                            <li key={i} className={styles.aiReportListItem}>
                              <span
                                className={`${styles.aiReportBullet} ${styles.aiReportBulletStep}`}
                              >
                                {i + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Sentiment + other string fields */}
                    <div className={styles.aiReportMeta}>
                      {Object.entries(report)
                        .filter(
                          ([k]) =>
                            !['summary', 'key_points', 'next_steps', 'meeting_id'].includes(k)
                        )
                        .map(([key, val]) =>
                          typeof val === 'string' ? (
                            <div key={key} className={styles.aiReportMetaItem}>
                              <span className={styles.aiReportMetaLabel}>
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className={styles.aiReportMetaValue}>{val}</span>
                            </div>
                          ) : null
                        )}
                    </div>
                  </div>
                </>
              ) : report && 'error' in report ? (
                <div className={styles.sidebarEmpty}>
                  <div
                    className={styles.sidebarEmptyIcon}
                    style={{ color: 'var(--color-warning-500, #f59e0b)' }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className={styles.sidebarEmptyTitle}>Report unavailable</div>
                  <div className={styles.sidebarEmptyText}>{report.error as string}</div>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={fetchReport}
                    disabled={!transcript}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className={styles.sidebarEmpty}>
                  <div className={styles.sidebarEmptyIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <div className={styles.sidebarEmptyTitle}>
                    {!transcript ? 'Transcript needed first' : 'No report yet'}
                  </div>
                  <div className={styles.sidebarEmptyText}>
                    {!transcript
                      ? 'Switch to the Transcript tab and fetch it first.'
                      : 'Generate an AI-powered summary of the meeting.'}
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={fetchReport}
                    disabled={!transcript || loadingReport}
                  >
                    Generate Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Onboarding Doc renderer ──────────────────────────────────────────────────
function OnboardingDocView({
  doc,
  docRef,
}: {
  doc: OnboardingDocument;
  docRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const val = (v: string | undefined) =>
    v ? (
      <span className={styles.docFieldValue}>{v}</span>
    ) : (
      <span className={styles.docFieldEmpty}>—</span>
    );

  const pills = (arr: string[] | undefined) =>
    arr?.length ? (
      <div className={styles.docPillList}>
        {arr.map((a, i) => (
          <span key={i} className={styles.docPill}>
            {a}
          </span>
        ))}
      </div>
    ) : (
      <span className={styles.docFieldEmpty}>—</span>
    );

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.docDocumentCard} ref={docRef}>
      {/* Hero */}
      <div className={styles.docHero}>
        <div className={styles.docHeroTop}>SOCIALJET · INFLUENCER MARKETING AGENCY</div>
        <div className={styles.docHeroSubLabel}>PREPARED FOR</div>
        <h2 className={styles.docHeroTitle}>
          SocialJet <span className={styles.docHeroCross}>×</span> {doc.brand?.name || 'Brand'}
        </h2>
        <div className={styles.docHeroBadge}>ONBOARDING DOCUMENT</div>
        {(doc.brand?.summary || doc.campaign?.marketing_message) && (
          <p className={styles.docHeroDesc}>
            {doc.brand?.summary || doc.campaign?.marketing_message}
          </p>
        )}
        <div className={styles.docHeroMetaRow}>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>PREPARED FOR</span>
            <span className={styles.docHeroMetaValue}>
              {doc.brand?.contact_name || doc.brand?.name || '—'}
            </span>
          </div>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>BUDGET</span>
            <span className={styles.docHeroMetaValue}>{doc.budget || '—'}</span>
          </div>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>DATE</span>
            <span className={styles.docHeroMetaValue}>{today}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.docBody}>
        {doc.raw_html ? (
          <div dangerouslySetInnerHTML={{ __html: doc.raw_html }} />
        ) : (
          <>
            {/* Brand */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Brand</span>
              </div>
              <div className={styles.docSectionBody}>
                {(
                  [
                    ['Brand Name', doc.brand?.name],
                    ['Industry', doc.brand?.industry],
                    ['Contact', doc.brand?.contact_name],
                    ['Email', doc.brand?.email],
                    ['Phone', doc.brand?.phone],
                    ['Website', doc.brand?.website],
                    ['Instagram', doc.brand?.instagram],
                    ['TikTok', doc.brand?.tiktok],
                    ['Facebook', doc.brand?.facebook],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className={styles.docField}>
                    <span className={styles.docFieldLabel}>{label}</span>
                    {val(value)}
                  </div>
                ))}
                {doc.brand?.summary && (
                  <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.docFieldLabel}>Summary</span>
                    {val(doc.brand.summary)}
                  </div>
                )}
              </div>
            </div>

            {/* Campaign */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Campaign</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Platforms</span>
                  {pills(doc.campaign?.platforms)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Geographic Focus</span>
                  {val(doc.campaign?.geographic_focus)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Marketing Message</span>
                  {val(doc.campaign?.marketing_message)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Deliverables</span>
                  {val(doc.campaign?.deliverables)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Objectives</span>
                  {pills(doc.campaign?.objectives)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Creative Angles</span>
                  {pills(doc.campaign?.creative_angles)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Content Timeline</span>
                  {val(doc.campaign?.content_timeline)}
                </div>
              </div>
            </div>

            {/* KOLs */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>KOLs</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Total Count</span>
                  {val(doc.kols?.total_count?.toString())}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Preferred Age Range</span>
                  {val(doc.kols?.preferred_age_range)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Ideal Profile</span>
                  {val(doc.kols?.ideal_profile)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>No-Gos</span>
                  {pills(doc.kols?.no_gos)}
                </div>
                {(doc.kols?.tier_breakdown?.length ?? 0) > 0 && (
                  <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.docFieldLabel}>Tier Breakdown</span>
                    <table className={styles.docTable}>
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.kols.tier_breakdown.map((t, i) => (
                          <tr key={i}>
                            <td>{t.tier}</td>
                            <td>{t.count ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Content</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Type Preferences</span>
                  {pills(doc.content?.type_preferences)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Tone & Style</span>
                  {val(doc.content?.tone_and_style)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Mandatory Inclusions</span>
                  {pills(doc.content?.mandatory_inclusions)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Content Don&apos;ts</span>
                  {pills(doc.content?.content_donts)}
                </div>
              </div>
            </div>

            {/* Product */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Product</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Main Products</span>
                  {pills(doc.product?.main_products)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>USPs</span>
                  {pills(doc.product?.usps)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Delivery By</span>
                  {val(doc.product?.delivery_by)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Loan / Given</span>
                  {val(doc.product?.loan_or_given)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Lead Time (days)</span>
                  {val(doc.product?.lead_time_days)}
                </div>
              </div>
            </div>

            {/* Offer & CTA */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Offer & CTA</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Offer</span>
                  {val(doc.offer_and_cta?.offer)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>CTA</span>
                  {val(doc.offer_and_cta?.cta)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>CTA Links</span>
                  {pills(doc.offer_and_cta?.cta_links)}
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Budget & Timeline</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Budget</span>
                  {val(doc.budget)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Posting Schedule</span>
                  {val(doc.timeline?.posting_schedule)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Start Date</span>
                  {val(doc.timeline?.start_date)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>End Date</span>
                  {val(doc.timeline?.end_date)}
                </div>
                {(doc.timeline?.key_dates?.length ?? 0) > 0 && (
                  <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.docFieldLabel}>Key Dates</span>
                    <table className={styles.docTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Milestone</th>
                          <th>Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.timeline.key_dates.map((d, i) => (
                          <tr key={i}>
                            <td>{d.date}</td>
                            <td>{d.milestone}</td>
                            <td>{d.owner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            {(doc.next_steps?.length ?? 0) > 0 && (
              <div className={styles.docSection}>
                <div className={styles.docSectionHeader}>
                  <span className={styles.docSectionTitle}>Next Steps</span>
                </div>
                <div className={styles.docSectionBodyFull}>
                  <table className={styles.docTable}>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Owner</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.next_steps.map((s, i) => (
                        <tr key={i}>
                          <td>{s.action}</td>
                          <td>{s.owner}</td>
                          <td>{s.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Items */}
            {(doc.pending_items?.length ?? 0) > 0 && (
              <div className={styles.docSection}>
                <div className={styles.docSectionHeader}>
                  <span className={styles.docSectionTitle}>Pending Items</span>
                </div>
                <div className={styles.docSectionBodyFull}>
                  <table className={styles.docTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>From</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.pending_items.map((p, i) => (
                        <tr key={i}>
                          <td>{p.item}</td>
                          <td>{p.from}</td>
                          <td>{p.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* docBody */}
    </div>
  );
}

// ─── KOL Brief renderer ───────────────────────────────────────────────────────
function KolBriefDocView({
  doc,
  docRef,
}: {
  doc: KolBriefDocument;
  docRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const val = (v: string | undefined) =>
    v ? (
      <span className={styles.docFieldValue}>{v}</span>
    ) : (
      <span className={styles.docFieldEmpty}>—</span>
    );

  const pills = (arr: string[] | undefined) =>
    arr?.length ? (
      <div className={styles.docPillList}>
        {arr.map((a, i) => (
          <span key={i} className={styles.docPill}>
            {a}
          </span>
        ))}
      </div>
    ) : (
      <span className={styles.docFieldEmpty}>—</span>
    );

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.docDocumentCard} ref={docRef}>
      {/* Hero */}
      <div className={styles.docHero}>
        <div className={styles.docHeroTop}>SOCIALJET · INFLUENCER MARKETING AGENCY</div>
        <div className={styles.docHeroSubLabel}>PREPARED FOR</div>
        <h2 className={styles.docHeroTitle}>
          SocialJet <span className={styles.docHeroCross}>×</span>{' '}
          {doc.campaign_overview?.brand_name || 'Brand'}
        </h2>
        <div className={styles.docHeroBadge}>KOL BRIEF</div>
        {(doc.campaign_overview?.objective || doc.campaign_overview?.marketing_message) && (
          <p className={styles.docHeroDesc}>
            {doc.campaign_overview?.objective || doc.campaign_overview?.marketing_message}
          </p>
        )}
        <div className={styles.docHeroMetaRow}>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>CAMPAIGN</span>
            <span className={styles.docHeroMetaValue}>
              {doc.campaign_overview?.campaign_name || '—'}
            </span>
          </div>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>PLATFORMS</span>
            <span className={styles.docHeroMetaValue}>
              {doc.campaign_overview?.platforms_and_format || '—'}
            </span>
          </div>
          <div className={styles.docHeroMetaItem}>
            <span className={styles.docHeroMetaLabel}>DATE</span>
            <span className={styles.docHeroMetaValue}>{today}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.docBody}>
        {doc.raw_html ? (
          <div dangerouslySetInnerHTML={{ __html: doc.raw_html }} />
        ) : (
          <>
            {/* Campaign Overview */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Campaign Overview</span>
              </div>
              <div className={styles.docSectionBody}>
                {(
                  [
                    ['Brand', doc.campaign_overview?.brand_name],
                    ['Campaign Name', doc.campaign_overview?.campaign_name],
                    ['Platforms & Format', doc.campaign_overview?.platforms_and_format],
                    ['Deliverables', doc.campaign_overview?.deliverables],
                    ['Deadlines', doc.campaign_overview?.deadlines],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className={styles.docField}>
                    <span className={styles.docFieldLabel}>{label}</span>
                    {val(value)}
                  </div>
                ))}
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Objective</span>
                  {val(doc.campaign_overview?.objective)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Marketing Message</span>
                  {val(doc.campaign_overview?.marketing_message)}
                </div>
              </div>
            </div>

            {/* Content Angle */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Content Angle</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Story Themes</span>
                  {pills(doc.content_angle?.story_theme)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>USPs</span>
                  {pills(doc.content_angle?.usps)}
                </div>
                {doc.content_angle?.usp_note && (
                  <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.docFieldLabel}>USP Note</span>
                    {val(doc.content_angle.usp_note)}
                  </div>
                )}
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>Suggested Hooks</span>
                  {pills(doc.content_angle?.suggested_hooks)}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>CTA</span>
              </div>
              <div className={styles.docSectionBody}>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Primary CTA</span>
                  {val(doc.cta?.primary_cta)}
                </div>
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Placement</span>
                  {val(doc.cta?.placement)}
                </div>
                <div className={`${styles.docField}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.docFieldLabel}>CTA Variations</span>
                  {pills(doc.cta?.suggested_ctas)}
                </div>
              </div>
            </div>

            {/* Content Board */}
            {(doc.content_board?.length ?? 0) > 0 && (
              <div className={styles.docSection}>
                <div className={styles.docSectionHeader}>
                  <span className={styles.docSectionTitle}>Content Board</span>
                </div>
                <div className={styles.docContentBoard}>
                  {doc.content_board.map((c, i) => (
                    <div key={i} className={styles.contentBoardCard}>
                      <div className={styles.contentBoardCardHeader}>{c.title}</div>
                      <div className={styles.contentBoardCardBody}>
                        <div className={styles.docField}>
                          <span className={styles.docFieldLabel}>Concept</span>
                          <span className={styles.docFieldValue}>{c.concept}</span>
                        </div>
                        <div className={styles.docField}>
                          <span className={styles.docFieldLabel}>Highlights</span>
                          {pills(c.highlights)}
                        </div>
                        <div className={styles.docField}>
                          <span className={styles.docFieldLabel}>CTA</span>
                          <span className={styles.docFieldValue}>{c.cta}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className={styles.docSection}>
              <div className={styles.docSectionHeader}>
                <span className={styles.docSectionTitle}>Guidelines</span>
              </div>
              <div className={styles.docSectionBody}>
                {(
                  [
                    ['Content Notes', doc.guidelines?.content_notes],
                    ['Timeliness', doc.guidelines?.timeliness],
                    ['Approval Process', doc.guidelines?.approval_process],
                    ['Content Usage', doc.guidelines?.content_usage],
                    ['Community Guidelines', doc.guidelines?.community_guidelines],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className={`${styles.docField}`}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <span className={styles.docFieldLabel}>{label}</span>
                    {val(value)}
                  </div>
                ))}
                <div className={styles.docField}>
                  <span className={styles.docFieldLabel}>Brand Socials</span>
                  <div className={styles.docPillList}>
                    {doc.guidelines?.brand_socials?.instagram && (
                      <span className={styles.docPill}>
                        IG: {doc.guidelines.brand_socials.instagram}
                      </span>
                    )}
                    {doc.guidelines?.brand_socials?.tiktok && (
                      <span className={styles.docPill}>
                        TK: {doc.guidelines.brand_socials.tiktok}
                      </span>
                    )}
                    {doc.guidelines?.brand_socials?.website && (
                      <span className={styles.docPill}>
                        🌐 {doc.guidelines.brand_socials.website}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* docBody */}
    </div>
  );
}

// ─── Documents Stage ──────────────────────────────────────────────────────────
function DocumentsStage({ leadId }: { leadId: string }) {
  const { data: docs, isLoading: docsLoading } = useCampaignDocuments(leadId);
  const { data: kolBrief, isLoading: kolLoading } = useKolBrief(leadId);
  const { data: meeting } = useCampaignMeeting(leadId);
  const { data: _lead } = useCampaignLeadDetail(leadId);
  const qc = useQueryClient();
  const docRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const [activeTab, setActiveTab] = useState<'onboarding' | 'kol_brief'>('onboarding');
  const [generating, setGenerating] = useState<'onboarding' | 'kol_brief' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sending, setSending] = useState(false);

  const onboardingDoc = docs?.find((d) => d.type === 'onboarding');
  const hasTranscript =
    meeting?.transcriptUrl ||
    meeting?.status === 'completed' ||
    meeting?.status === ('done' as string);

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    cm_approved: 'Submitted to Admin',
    admin_approved: 'Admin Approved',
    sent_to_client: 'Sent to Client',
    rejected: 'Rejected',
  };
  const statusStyle: Record<string, string> = {
    draft: styles.statusDraft,
    cm_approved: styles.statusApproved,
    admin_approved: styles.statusApproved,
    sent_to_client: styles.statusSent,
    rejected: styles.statusRejected,
  };

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const handleToggleEdit = () => {
    if (editMode) {
      // Cancel — discard changes
      editorRef.current = null;
      setEditMode(false);
    } else {
      editorRef.current = null;
      setEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editorRef.current) return;
    const editedHTML = editorRef.current.getHTML();

    setSaving(true);
    try {
      if (activeTab === 'onboarding' && onboardingDoc) {
        const updated = await campaignsService.updateOnboardingDocument(onboardingDoc.id, {
          ...(onboardingDoc.document ?? {}),
          raw_html: editedHTML,
        } as typeof onboardingDoc.document);
        qc.setQueryData(['campaign-documents', leadId], (prev: typeof docs) => {
          return (prev ?? []).map((d) => (d.id === onboardingDoc.id ? updated : d));
        });
      } else if (activeTab === 'kol_brief' && kolBrief) {
        const updated = await campaignsService.updateKolBriefDocument(kolBrief.id, {
          ...(kolBrief.document ?? {}),
          raw_html: editedHTML,
        } as typeof kolBrief.document);
        qc.setQueryData(['kol-brief', leadId], updated);
      }
      editorRef.current = null;
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!docRef.current) return;
    const html = docRef.current.outerHTML;
    const styleBlocks = Array.from(document.querySelectorAll('style'))
      .map((el) => `<style>${el.textContent}</style>`)
      .join('\n');
    const linkTags = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    )
      .map((el) => `<link rel="stylesheet" href="${el.href}">`)
      .join('\n');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.documentElement.innerHTML = `<head>
<meta charset="utf-8">
<title>Document</title>
${linkTags}
${styleBlocks}
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { body { padding: 0; } @page { margin: 0; } }
</style>
</head>
<body>${html}</body>`;
    win.focus();
    setTimeout(() => win.print(), 600);
  }, []);

  const getDocHTML = (): string => {
    if (editorRef.current && editMode) return editorRef.current.getHTML();
    return docRef.current?.outerHTML ?? '';
  };

  const handleSend = async () => {
    const html = getDocHTML();
    if (!html) return;
    setSending(true);
    try {
      const opts = {
        toEmail: sendEmail || undefined,
        subject: sendSubject || undefined,
        message: sendMessage || undefined,
      };
      if (activeTab === 'onboarding') {
        await campaignsService.sendOnboardingPdf(leadId, html, opts);
      } else {
        await campaignsService.sendKolBriefPdf(leadId, html, opts);
      }
      setShowSendModal(false);
    } finally {
      setSending(false);
    }
  };

  async function handleGenerate(type: 'onboarding' | 'kol_brief') {
    setGenerating(type);
    try {
      if (type === 'onboarding') {
        const doc = await campaignsService.generateOnboarding(leadId, meeting?.id);
        qc.setQueryData(['campaign-documents', leadId], (prev: typeof docs) => {
          const existing = (prev ?? []).filter((d) => d.type !== 'onboarding');
          return [...existing, doc];
        });
      } else {
        const brief = await campaignsService.generateKolBrief(leadId);
        qc.setQueryData(['kol-brief', leadId], brief);
      }
    } finally {
      setGenerating(null);
    }
  }

  async function handleSubmitOnboarding() {
    if (!onboardingDoc) return;
    setSubmitting(true);
    try {
      await campaignsService.submitDocumentToAdmin(leadId, onboardingDoc.id);
      qc.invalidateQueries({ queryKey: ['campaign-documents', leadId] });
      qc.invalidateQueries({ queryKey: [CAMPAIGN_LEADS_KEY, leadId] });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitKolBrief() {
    if (!kolBrief) return;
    setSubmitting(true);
    try {
      await campaignsService.submitKolBrief(kolBrief.id);
      qc.invalidateQueries({ queryKey: ['kol-brief', leadId] });
    } finally {
      setSubmitting(false);
    }
  }

  const activeDoc = activeTab === 'onboarding' ? onboardingDoc : null;
  const activeKol = activeTab === 'kol_brief' ? kolBrief : null;
  const activeStatus = activeTab === 'onboarding' ? onboardingDoc?.status : kolBrief?.status;
  const isLoading = activeTab === 'onboarding' ? docsLoading : kolLoading;
  const hasDoc = activeTab === 'onboarding' ? !!onboardingDoc?.document : !!kolBrief?.document;

  // Initial HTML for editor — use current rendered card HTML
  const editorInitialHTML = docRef.current?.outerHTML ?? '';

  const activeRejectionReason =
    activeTab === 'onboarding' && onboardingDoc?.status === 'rejected'
      ? onboardingDoc.rejectionReason
      : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Documents</h2>
        {hasDoc && activeStatus && (
          <div className={styles.docViewerActions}>
            <span className={`${styles.statusBadge} ${statusStyle[activeStatus] ?? ''}`}>
              {statusLabel[activeStatus] ?? activeStatus}
            </span>

            {/* Edit / Done / Cancel */}
            {editMode ? (
              <>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={handleToggleEdit}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  disabled={saving}
                  onClick={handleSaveEdit}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  className={`${styles.docActionIconBtn} ${styles.docActionIconBtnActive}`}
                  aria-label="Edit document"
                  onClick={handleToggleEdit}
                >
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
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  className={styles.docActionIconBtn}
                  aria-label="Download PDF"
                  onClick={handleDownload}
                >
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
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  PDF
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={submitting || activeTab === 'kol_brief'}
                  style={
                    activeTab === 'kol_brief'
                      ? { opacity: 0.35, cursor: 'not-allowed', filter: 'blur(0.4px)' }
                      : undefined
                  }
                  onClick={
                    activeTab === 'onboarding' ? handleSubmitOnboarding : handleSubmitKolBrief
                  }
                >
                  {submitting ? 'Submitting…' : 'Send for Approval'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.docTabs}>
        <button
          className={`${styles.docTab} ${activeTab === 'onboarding' ? styles.docTabActive : ''}`}
          onClick={() => {
            setActiveTab('onboarding');
            setEditMode(false);
            editorRef.current = null;
          }}
        >
          Onboarding Doc
          {onboardingDoc && (
            <span style={{ marginLeft: 6, color: 'var(--color-success-600)' }}>✓</span>
          )}
        </button>
        <button
          className={`${styles.docTab} ${activeTab === 'kol_brief' ? styles.docTabActive : ''}`}
          onClick={() => {
            setActiveTab('kol_brief');
            setEditMode(false);
            editorRef.current = null;
          }}
        >
          KOL Brief
          {kolBrief && <span style={{ marginLeft: 6, color: 'var(--color-success-600)' }}>✓</span>}
        </button>
      </div>

      {/* Rejection reason banner */}
      {activeRejectionReason && (
        <div className={styles.rejectionBanner}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <strong>Rejected by Admin:</strong> {activeRejectionReason}
          </span>
        </div>
      )}

      {/* Body */}
      <div className={styles.docViewer}>
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.docSection}>
                <div className={styles.docSectionHeader}>
                  <div className={styles.shimmer} style={{ height: 12, width: 120 }} />
                </div>
                <div className={styles.docShimmerGrid}>
                  {[140, 100, 160, 120, 180, 90].map((w, j) => (
                    <div key={j} className={styles.shimmer} style={{ height: 14, width: w }} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : !hasDoc ? (
          <div className={styles.docGenerateState}>
            <div className={styles.docGenerateIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <p className={styles.docGenerateTitle}>
                {activeTab === 'onboarding' ? 'Generate Onboarding Document' : 'Generate KOL Brief'}
              </p>
              <p className={styles.docGenerateDesc}>
                {activeTab === 'onboarding'
                  ? hasTranscript
                    ? 'Transcript is available. Generate the onboarding document from this meeting.'
                    : 'This document will be generated once the meeting transcript is available.'
                  : 'Generate the KOL brief for influencers based on the campaign details.'}
              </p>
            </div>
            {(activeTab === 'kol_brief' || hasTranscript) && (
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={generating === activeTab}
                onClick={() => handleGenerate(activeTab)}
              >
                {generating === activeTab
                  ? 'Generating…'
                  : `Generate ${activeTab === 'onboarding' ? 'Onboarding Doc' : 'KOL Brief'}`}
              </button>
            )}
          </div>
        ) : editMode ? (
          <ProposalEditor
            key={`doc-editor-${activeTab}`}
            initialContent={editorInitialHTML}
            onEditorReady={handleEditorReady}
          />
        ) : (
          <>
            {activeTab === 'onboarding' && activeDoc?.document && (
              <OnboardingDocView doc={activeDoc.document} docRef={docRef} />
            )}
            {activeTab === 'kol_brief' && activeKol?.document && (
              <KolBriefDocView doc={activeKol.document} docRef={docRef} />
            )}
          </>
        )}
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSendModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Send Document</h3>
              <button className={styles.modalClose} onClick={() => setShowSendModal(false)}>
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  To Email <span className={styles.formOptional}>(optional)</span>
                </label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder="client@example.com"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Subject <span className={styles.formOptional}>(optional)</span>
                </label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Message <span className={styles.formOptional}>(optional)</span>
                </label>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Add a personal note…"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowSendModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={sending}
                onClick={handleSend}
              >
                {sending ? 'Sending…' : 'Send Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deal Negotiation Stage ───────────────────────────────────────────────────
function DealStage({ leadId }: { leadId: string }) {
  const { data: influencers, isLoading } = useLeadInfluencers(leadId);
  const qc = useQueryClient();

  if (isLoading) return <StageSkeleton />;

  const approved = (influencers ?? []).filter(
    (i) => i.status === 'cm_approved' || i.status === 'client_approved'
  );

  async function updateDeal(influencerId: string, amount: number, notes: string) {
    await campaignsService.updateInfluencerDeal(leadId, influencerId, {
      status: 'negotiating',
      amount,
      notes,
    });
    qc.invalidateQueries({ queryKey: ['lead-influencers', leadId] });
  }

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Deal Negotiation</h2>
      </div>
      <div className={styles.stageBody}>
        <div className={styles.dealList}>
          {approved.map((inf) => (
            <div key={inf.id} className={styles.dealCard}>
              <div className={styles.dealTop}>
                <span className={styles.dealName}>{inf.name}</span>
                <span
                  className={`${styles.statusBadge} ${inf.dealStatus === 'closed' ? styles.statusClosed : inf.dealStatus === 'negotiating' ? styles.statusNegotiating : styles.statusPending}`}
                >
                  {inf.dealStatus ?? 'Pending'}
                </span>
              </div>
              {inf.dealAmount && (
                <div className={styles.dealAmount}>${inf.dealAmount.toLocaleString()}</div>
              )}
              {inf.dealNotes && <div className={styles.dealNotes}>{inf.dealNotes}</div>}
              {inf.dealStatus !== 'closed' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                    onClick={() => updateDeal(inf.id, inf.dealAmount ?? 0, inf.dealNotes ?? '')}
                  >
                    Update Deal
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                    onClick={() =>
                      campaignsService.updateInfluencerDeal(leadId, inf.id, { status: 'closed' })
                    }
                  >
                    Mark Closed
                  </button>
                </div>
              )}
            </div>
          ))}
          {!approved.length && (
            <div
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
                textAlign: 'center',
                padding: 'var(--space-8)',
              }}
            >
              Approve influencers first to start deal negotiation
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Content Review Stage ─────────────────────────────────────────────────────
function ContentReviewStage({ leadId }: { leadId: string }) {
  const { data: content, isLoading } = useLeadContent(leadId);
  const qc = useQueryClient();

  async function updateStatus(contentId: string, status: 'cm_approved' | 'cm_rejected') {
    await campaignsService.updateContentStatus(leadId, contentId, status);
    qc.invalidateQueries({ queryKey: ['lead-content', leadId] });
  }

  if (isLoading) return <StageSkeleton />;

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Content Review</h2>
      </div>
      <div className={styles.stageBody}>
        <div className={styles.contentGrid}>
          {(content ?? []).map((item) => (
            <div key={item.id} className={styles.contentCard}>
              <div className={styles.contentThumb}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className={styles.contentInfo}>
                <div className={styles.contentMeta}>
                  <span className={styles.contentInfluencer}>{item.influencerName}</span>
                  <span
                    className={`${styles.platformBadge} ${styles[`platform${item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}` as keyof typeof styles]}`}
                  >
                    {item.platform}
                  </span>
                </div>
                <a
                  href={item.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.contentLink}
                >
                  {item.contentUrl}
                </a>
                <span
                  className={`${styles.statusBadge} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}` as keyof typeof styles] ?? styles.statusPending}`}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>
              {item.status === 'submitted' && (
                <div className={styles.contentActions}>
                  <button
                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                    onClick={() => updateStatus(item.id, 'cm_approved')}
                  >
                    Approve
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                    onClick={() => updateStatus(item.id, 'cm_rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
              {item.status === 'cm_approved' && (
                <div className={styles.contentActions}>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      const date = prompt('Enter publish date & time (YYYY-MM-DD HH:MM)');
                      if (date) campaignsService.scheduleContent(leadId, item.id, date);
                    }}
                  >
                    Assign Publish Date
                  </button>
                </div>
              )}
            </div>
          ))}
          {!content?.length && (
            <div
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
                textAlign: 'center',
                padding: 'var(--space-8)',
                gridColumn: '1 / -1',
              }}
            >
              No content submitted yet. Influencers can share their content links via Inbox.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StageSkeleton() {
  return (
    <>
      <div className={styles.stageHeader}>
        <div className={styles.shimmer} style={{ height: 24, width: 160 }} />
      </div>
      <div className={styles.stageBody}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className={styles.shimmer} style={{ height: 14, width: '40%' }} />
            <div className={styles.shimmer} style={{ height: 48, width: '100%' }} />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Main StagePanel ──────────────────────────────────────────────────────────
const STAGE_GROUPS: Record<CampaignLeadStage, string> = {
  unassigned: 'lead',
  assigned: 'lead',
  questionnaire_sent: 'questionnaire',
  questionnaire_received: 'questionnaire',
  meeting_booked: 'meeting',
  meeting_done: 'meeting',
  documents_generated: 'documents',
  documents_cm_approved: 'documents',
  documents_admin_approved: 'documents',
  documents_sent_to_client: 'documents',
  influencer_selection: 'influencer',
  influencer_cm_approved: 'influencer',
  influencer_client_approved: 'influencer',
  deal_negotiation: 'deal',
  deal_closed: 'deal',
  client_informed: 'deal',
  content_review: 'content',
  content_cm_approved: 'content',
  content_client_approved: 'content',
  publish_date_assigned: 'content',
  live: 'live',
  complete: 'live',
};

interface Props {
  leadId: string;
  activeStage: CampaignLeadStage;
}

export function StagePanel({ leadId, activeStage }: Props) {
  const group = STAGE_GROUPS[activeStage];

  const renderContent = () => {
    switch (group) {
      case 'lead':
        return <LeadStage leadId={leadId} />;
      case 'questionnaire':
        return <QuestionnaireStage leadId={leadId} />;
      case 'meeting':
        return <MeetingStage leadId={leadId} />;
      case 'documents':
        return <DocumentsStage leadId={leadId} />;
      case 'influencer':
        return <InfluencerDiscovery leadId={leadId} />;
      case 'deal':
        return <DealStage leadId={leadId} />;
      case 'content':
        return <ContentReviewStage leadId={leadId} />;
      default:
        return (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <span className={styles.placeholderText}>
              Select a stage from the timeline to view details
            </span>
          </div>
        );
    }
  };

  return <div className={styles.root}>{renderContent()}</div>;
}
