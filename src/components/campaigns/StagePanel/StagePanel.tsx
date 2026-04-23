'use client';

import { useState } from 'react';
import styles from './StagePanel.module.css';
import {
  useQuestionnaire,
  useCampaignMeeting,
  useCampaignDocuments,
  useLeadInfluencers,
  useLeadContent,
} from '@/hooks/useCampaignLeads';
import { campaignsService } from '@/services/campaigns.service';
import { useQueryClient } from '@tanstack/react-query';
import type { CampaignLeadStage, CampaignInfluencer } from '@/types/campaign.types';

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Questionnaire Stage ──────────────────────────────────────────────────────
function QuestionnaireStage({ leadId }: { leadId: string }) {
  const { data: q, isLoading } = useQuestionnaire(leadId);
  const qc = useQueryClient();

  async function handleSend() {
    await campaignsService.sendQuestionnaire(leadId);
    qc.invalidateQueries({ queryKey: ['campaign-questionnaire', leadId] });
  }

  if (isLoading) return <StageSkeleton />;

  const isSent = !!q?.sentAt;
  const isReceived = !!q?.receivedAt;

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Questionnaire</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {isReceived ? (
            <span className={`${styles.statusBadge} ${styles.statusReceived}`}>Received</span>
          ) : isSent ? (
            <span className={`${styles.statusBadge} ${styles.statusSent}`}>Sent</span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Not sent</span>
          )}
          {!isSent && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSend}>
              Send to Client
            </button>
          )}
        </div>
      </div>
      <div className={styles.stageBody}>
        {isSent && (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sent</span>
              <span className={styles.infoValue}>
                {new Date(q!.sentAt!).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {isReceived && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Received</span>
                <span className={styles.infoValue}>
                  {new Date(q!.receivedAt!).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}
        <div className={styles.questionList}>
          {(q?.questions ?? []).map((item) => (
            <div key={item.id} className={styles.questionItem}>
              <div className={styles.questionText}>{item.question}</div>
              <div
                className={`${styles.questionAnswer} ${!item.answer ? styles.questionEmpty : ''}`}
              >
                {item.answer ?? 'Awaiting response…'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Meeting Stage ────────────────────────────────────────────────────────────
function MeetingStage({ leadId }: { leadId: string }) {
  const { data: meeting, isLoading } = useCampaignMeeting(leadId);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [emails, setEmails] = useState('');
  const qc = useQueryClient();

  async function handleSchedule() {
    await campaignsService.scheduleMeeting(leadId, {
      scheduledAt,
      inviteEmails: emails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean),
    });
    qc.invalidateQueries({ queryKey: ['campaign-meeting', leadId] });
    setShowSchedule(false);
  }

  if (isLoading) return <StageSkeleton />;

  const isScheduled = meeting?.status === 'scheduled';
  const isDone = meeting?.status === 'completed';

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Meeting</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {isDone ? (
            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span>
          ) : isScheduled ? (
            <span className={`${styles.statusBadge} ${styles.statusScheduled}`}>Scheduled</span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Not Scheduled</span>
          )}
          {!isScheduled && !isDone && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowSchedule(true)}
            >
              Book Meeting
            </button>
          )}
        </div>
      </div>
      <div className={styles.stageBody}>
        {(isScheduled || isDone) && meeting && (
          <div className={styles.meetingCard}>
            <div className={styles.meetingRow}>
              <span className={styles.meetingLabel}>Date & Time</span>
              <span className={styles.meetingValue}>
                {new Date(meeting.scheduledAt!).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className={styles.meetingRow}>
              <span className={styles.meetingLabel}>Duration</span>
              <span className={styles.meetingValue}>{meeting.duration ?? 60} min</span>
            </div>
            {meeting.zoomLink && (
              <div className={styles.meetingRow}>
                <span className={styles.meetingLabel}>Zoom</span>
                <a
                  href={meeting.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.zoomLink}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                  </svg>
                  Join Zoom
                </a>
              </div>
            )}
            {isDone && meeting.transcriptUrl && (
              <div className={styles.meetingRow}>
                <span className={styles.meetingLabel}>Transcript</span>
                <a
                  href={meeting.transcriptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.zoomLink}
                >
                  View Transcript
                </a>
              </div>
            )}
            {isDone && meeting.reportUrl && (
              <div className={styles.meetingRow}>
                <span className={styles.meetingLabel}>Report</span>
                <a
                  href={meeting.reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.zoomLink}
                >
                  View Report
                </a>
              </div>
            )}
          </div>
        )}

        {showSchedule && (
          <div className={styles.meetingCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Date & Time</label>
                <input
                  type="datetime-local"
                  className={styles.questionAnswer}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Invite Emails (comma-separated)</label>
                <input
                  type="text"
                  className={styles.questionAnswer}
                  placeholder="client@email.com, team@company.com"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSchedule}>
                  Confirm & Book
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
    </>
  );
}

// ─── Documents Stage ──────────────────────────────────────────────────────────
function DocumentsStage({ leadId }: { leadId: string }) {
  const { data: docs, isLoading } = useCampaignDocuments(leadId);
  const qc = useQueryClient();

  async function handleSubmitToAdmin(docId: string) {
    await campaignsService.submitDocumentToAdmin(leadId, docId);
    qc.invalidateQueries({ queryKey: ['campaign-documents', leadId] });
  }

  if (isLoading) return <StageSkeleton />;

  const docTypeLabels: Record<string, string> = {
    onboarding: 'Onboarding Document',
    kol_briefing: 'KOL Briefing',
  };
  const statusStyle: Record<string, string> = {
    draft: styles.statusDraft,
    cm_approved: styles.statusApproved,
    admin_approved: styles.statusApproved,
    sent_to_client: styles.statusSent,
  };
  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    cm_approved: 'Submitted to Admin',
    admin_approved: 'Admin Approved',
    sent_to_client: 'Sent to Client',
  };

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Documents</h2>
      </div>
      <div className={styles.stageBody}>
        {(docs ?? []).map((doc) => (
          <div key={doc.id} className={styles.docCard}>
            <div className={styles.docCardHeader}>
              <span className={styles.docType}>{docTypeLabels[doc.type] ?? doc.type}</span>
              <div className={styles.docActions}>
                <span className={`${styles.statusBadge} ${statusStyle[doc.status] ?? ''}`}>
                  {statusLabel[doc.status] ?? doc.status}
                </span>
                {doc.status === 'draft' && (
                  <button
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                    onClick={() => handleSubmitToAdmin(doc.id)}
                  >
                    Submit to Admin
                  </button>
                )}
              </div>
            </div>
            <div
              className={styles.docContent}
              contentEditable={doc.status === 'draft'}
              suppressContentEditableWarning
              onBlur={(e) =>
                campaignsService.updateDocument(leadId, doc.id, e.currentTarget.textContent ?? '')
              }
            >
              {doc.content}
            </div>
          </div>
        ))}
        {!docs?.length && (
          <div
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
              textAlign: 'center',
              padding: 'var(--space-8)',
            }}
          >
            Documents will be generated after the meeting is completed
          </div>
        )}
      </div>
    </>
  );
}

// ─── Influencer Selection Stage ───────────────────────────────────────────────
function InfluencerSelectionStage({ leadId }: { leadId: string }) {
  const { data: influencers, isLoading } = useLeadInfluencers(leadId);
  const qc = useQueryClient();

  async function updateStatus(influencerId: string, status: CampaignInfluencer['status']) {
    await campaignsService.updateInfluencerStatus(leadId, influencerId, status);
    qc.invalidateQueries({ queryKey: ['lead-influencers', leadId] });
  }

  if (isLoading) return <StageSkeleton />;

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <>
      <div className={styles.stageHeader}>
        <h2 className={styles.stageTitle}>Influencer Selection</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className={`${styles.btn} ${styles.btnSecondary}`}>+ Add Influencer</button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => campaignsService.sendInfluencersToClient(leadId)}
          >
            Send to Client
          </button>
        </div>
      </div>
      <div className={styles.stageBody}>
        <div className={styles.influencerGrid}>
          {(influencers ?? []).map((inf) => (
            <div
              key={inf.id}
              className={`${styles.influencerCard} ${inf.status === 'cm_approved' || inf.status === 'client_approved' ? styles.influencerCardApproved : inf.status === 'cm_rejected' || inf.status === 'client_rejected' ? styles.influencerCardRejected : ''}`}
            >
              <div className={styles.influencerTop}>
                <div className={styles.influencerAvatar}>{getInitials(inf.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.influencerName}>{inf.name}</div>
                  <div className={styles.influencerHandle}>@{inf.handle}</div>
                </div>
                <span
                  className={`${styles.platformBadge} ${styles[`platform${inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1)}` as keyof typeof styles]}`}
                >
                  {inf.platform}
                </span>
              </div>
              <div className={styles.influencerStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatFollowers(inf.followers)}</span>
                  <span className={styles.statLabel}>Followers</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{inf.engagementRate.toFixed(1)}%</span>
                  <span className={styles.statLabel}>Engagement</span>
                </div>
              </div>
              {inf.isRecommended && (
                <span
                  className={`${styles.statusBadge} ${styles.statusPending}`}
                  style={{ alignSelf: 'flex-start' }}
                >
                  AI Recommended
                </span>
              )}
              {(inf.status === 'recommended' || inf.status === 'assigned') && (
                <div className={styles.influencerActions}>
                  <button
                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                    onClick={() => updateStatus(inf.id, 'cm_approved')}
                  >
                    Approve
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                    onClick={() => updateStatus(inf.id, 'cm_rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
              {(inf.status === 'cm_approved' || inf.status === 'client_approved') && (
                <span
                  className={`${styles.statusBadge} ${styles.statusApproved}`}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {inf.status === 'client_approved' ? 'Client Approved' : 'CM Approved'}
                </span>
              )}
            </div>
          ))}
        </div>
        {!influencers?.length && (
          <div
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
              textAlign: 'center',
              padding: 'var(--space-8)',
            }}
          >
            No influencers added yet. Add from the Influencers page or wait for AI recommendations.
          </div>
        )}
      </div>
    </>
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
      case 'questionnaire':
        return <QuestionnaireStage leadId={leadId} />;
      case 'meeting':
        return <MeetingStage leadId={leadId} />;
      case 'documents':
        return <DocumentsStage leadId={leadId} />;
      case 'influencer':
        return <InfluencerSelectionStage leadId={leadId} />;
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
