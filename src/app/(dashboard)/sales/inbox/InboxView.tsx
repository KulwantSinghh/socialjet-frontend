'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './InboxView.module.css';
import {
  useInboxConversations,
  useInboxConversation,
  useSendInboxMessage,
  usePauseAutomation,
  useResumeAutomation,
} from '@/hooks/useInbox';
import { useLeadTimeline } from '@/hooks/useLeadTimeline';
import type { InboxConversation, InboxMessage } from '@/types/inbox.types';
import { cn } from '@/lib/utils';

// ─── Icons ────────────────────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);
const EmailIcon = () => (
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
const SendIcon = () => (
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
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ExternalLinkIcon = () => (
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
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const PauseIcon = () => (
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
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const PlayIcon = () => (
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
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const MeetingIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const ProposalIcon = () => (
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
  </svg>
);
const BotIcon = () => (
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
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2" />
    <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2" />
  </svg>
);
const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}
function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STAGE_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'New Lead', color: '#6c63ff' },
  contacted: { label: 'Nurturing', color: '#3b82f6' },
  nurture: { label: 'Nurturing', color: '#3b82f6' },
  qualified: { label: 'Meeting', color: '#f59e0b' },
  meeting_booked: { label: 'Meeting', color: '#f59e0b' },
  proposal: { label: 'Proposal', color: '#f97316' },
  proposal_sent: { label: 'Proposal Sent', color: '#16a34a' },
  closed: { label: 'Closed Won', color: '#22c55e' },
  canceled: { label: 'Dead', color: '#ef4444' },
};

const PROPOSAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_approval: { label: 'Pending Approval', color: '#f59e0b' },
  approved: { label: 'Approved', color: '#22c55e' },
  sent: { label: 'Sent to Client', color: '#3b82f6' },
  client_accepted: { label: 'Client Accepted', color: '#16a34a' },
  client_rejected: { label: 'Client Rejected', color: '#ef4444' },
};

const MEETING_NUM_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

// ─── Calendly icon ────────────────────────────────────────────────────────────
const CalendlyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" />
  </svg>
);

// ─── Channel badge ────────────────────────────────────────────────────────────
function ChannelBadge({ source }: { source: string }) {
  if (source === 'whatsapp')
    return (
      <span className={cn(styles.channelBadge, styles.channelWhatsapp)}>
        <WhatsAppIcon /> WhatsApp
      </span>
    );
  if (source === 'calendly')
    return (
      <span className={cn(styles.channelBadge, styles.channelCalendly)}>
        <CalendlyIcon /> Calendly
      </span>
    );
  return (
    <span className={cn(styles.channelBadge, styles.channelEmail)}>
      <EmailIcon /> Email
    </span>
  );
}

// ─── Conv list item ───────────────────────────────────────────────────────────
function ConvItem({
  conv,
  isActive,
  onClick,
}: {
  conv: InboxConversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const initials = conv.lead_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const stage = STAGE_MAP[conv.lead_status] ?? { label: conv.lead_status, color: '#6b7280' };

  return (
    <button className={cn(styles.convItem, isActive && styles.convItemActive)} onClick={onClick}>
      <div className={styles.convAvatarWrap}>
        <div className={styles.convAvatar}>{initials}</div>
        {conv.automation_paused && <span className={styles.pausedDot} title="Automation paused" />}
      </div>
      <div className={styles.convMeta}>
        <div className={styles.convTop}>
          <span className={styles.convName}>{conv.lead_name}</span>
          <span className={styles.convTime}>{formatTime(conv.last_message_at)}</span>
        </div>
        <div className={styles.convPreviewRow}>
          <span className={styles.convPreview}>{conv.last_message}</span>
          {conv.unread_count > 0 && <span className={styles.unreadBadge}>{conv.unread_count}</span>}
        </div>
        <div className={styles.convFooterRow}>
          <ChannelBadge source={conv.lead_source} />
          <span
            className={styles.stagePill}
            style={{ background: `${stage.color}15`, color: stage.color }}
          >
            {stage.label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Context panel (right) ────────────────────────────────────────────────────
function ContextPanel({ conv }: { conv: InboxConversation }) {
  const router = useRouter();
  const pause = usePauseAutomation(conv.lead_id);
  const resume = useResumeAutomation(conv.lead_id);
  const { data: timelineData } = useLeadTimeline(conv.lead_id);

  const stage = STAGE_MAP[conv.lead_status] ?? { label: conv.lead_status, color: '#6b7280' };
  const proposal = conv.proposal_status ? PROPOSAL_STATUS_LABELS[conv.proposal_status] : null;
  const recentEvents = timelineData?.timeline?.slice(0, 4) ?? [];
  const isPaused = conv.automation_paused;

  return (
    <div className={styles.contextPanel}>
      {/* Lead summary */}
      <div className={styles.ctxSection}>
        <div className={styles.ctxLeadHeader}>
          <div className={styles.ctxAvatar}>{conv.lead_name.charAt(0).toUpperCase()}</div>
          <div>
            <p className={styles.ctxLeadName}>{conv.lead_name}</p>
            {conv.lead_company && <p className={styles.ctxLeadCompany}>{conv.lead_company}</p>}
          </div>
        </div>
        <div
          className={styles.ctxStagePill}
          style={{
            background: `${stage.color}12`,
            color: stage.color,
            border: `1px solid ${stage.color}30`,
          }}
        >
          {stage.label}
        </div>
      </div>

      <div className={styles.ctxDivider} />

      {/* Automation toggle */}
      <div className={styles.ctxSection}>
        <p className={styles.ctxSectionTitle}>WhatsApp Automation</p>
        <div className={styles.automationRow}>
          <div className={styles.automationStatus}>
            <span
              className={cn(
                styles.automationDot,
                isPaused ? styles.automationDotPaused : styles.automationDotActive
              )}
            />
            <span className={styles.automationLabel}>
              {isPaused ? 'Paused — you are in control' : 'Active — AI is responding'}
            </span>
          </div>
          <button
            className={cn(
              styles.automationToggleBtn,
              isPaused ? styles.resumeBtn : styles.pauseBtn
            )}
            onClick={() => (isPaused ? resume.mutate() : pause.mutate())}
            disabled={pause.isPending || resume.isPending}
          >
            {isPaused ? (
              <>
                <PlayIcon /> Resume AI
              </>
            ) : (
              <>
                <PauseIcon /> Pause AI
              </>
            )}
          </button>
        </div>
        {isPaused && (
          <p className={styles.automationNote}>
            You can reply manually. AI will not send any messages until resumed.
          </p>
        )}
      </div>

      <div className={styles.ctxDivider} />

      {/* Meetings */}
      <div className={styles.ctxSection}>
        <p className={styles.ctxSectionTitle}>Meetings</p>
        {conv.meeting_count === 0 ? (
          <p className={styles.ctxEmpty}>No meetings yet</p>
        ) : (
          <div className={styles.ctxMeetingInfo}>
            <span className={styles.ctxMeetingCount}>
              {conv.meeting_count} meeting{conv.meeting_count > 1 ? 's' : ''} total
            </span>
            {conv.next_meeting && (
              <div className={styles.ctxNextMeeting}>
                <MeetingIcon />
                <div>
                  <p className={styles.ctxNextMeetingLabel}>
                    {MEETING_NUM_LABELS[(conv.next_meeting.meeting_number ?? 1) - 1] ??
                      `${conv.next_meeting.meeting_number}th`}{' '}
                    meeting — upcoming
                  </p>
                  <p className={styles.ctxNextMeetingTime}>
                    {formatDateTime(conv.next_meeting.scheduled_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.ctxDivider} />

      {/* Proposal */}
      <div className={styles.ctxSection}>
        <p className={styles.ctxSectionTitle}>Proposal</p>
        {!proposal ? (
          <p className={styles.ctxEmpty}>No proposal yet</p>
        ) : (
          <div className={styles.ctxProposalRow}>
            <ProposalIcon />
            <span className={styles.ctxProposalStatus} style={{ color: proposal.color }}>
              {proposal.label}
            </span>
          </div>
        )}
      </div>

      {/* Timeline */}
      {recentEvents.length > 0 && (
        <>
          <div className={styles.ctxDivider} />
          <div className={styles.ctxSection}>
            <p className={styles.ctxSectionTitle}>Recent Activity</p>
            <div className={styles.ctxTimeline}>
              {recentEvents.map((ev) => (
                <div key={ev.event_id} className={styles.ctxTimelineRow}>
                  <span className={styles.ctxTimelineDot} />
                  <div className={styles.ctxTimelineContent}>
                    <p className={styles.ctxTimelineTitle}>{ev.title}</p>
                    <p className={styles.ctxTimelineTime}>{formatTime(ev.created_at)} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={styles.ctxFooter}>
        <button
          className={styles.viewFullProfileBtn}
          onClick={() => router.push(`/sales/leads/${conv.lead_id}`)}
        >
          <ExternalLinkIcon /> Open Full Lead Profile
        </button>
      </div>
    </div>
  );
}

// ─── Attachment icon ──────────────────────────────────────────────────────────
const AttachIcon = () => (
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
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

// ─── Chat panel (middle) ──────────────────────────────────────────────────────
function ChatPanel({ leadId }: { leadId: string }) {
  const { data: conv, isLoading } = useInboxConversation(leadId);
  const sendMessage = useSendInboxMessage(leadId);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  // Derive available channels: prefer explicit list from API, else derive from lead_source
  const availableChannels: ('whatsapp' | 'email')[] = conv
    ? (conv.available_channels?.filter(
        (c): c is 'whatsapp' | 'email' => c === 'whatsapp' || c === 'email'
      ) ?? (conv.lead_source === 'whatsapp' ? ['whatsapp'] : ['email']))
    : ['whatsapp'];

  const hasBoth = availableChannels.includes('whatsapp') && availableChannels.includes('email');

  // Auto-select default channel
  useEffect(() => {
    if (!conv) return;
    if (availableChannels.includes('whatsapp')) setChannel('whatsapp');
    else setChannel('email');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.lead_id]);

  const canSend =
    channel === 'email'
      ? !!subject.trim() && !!text.trim() && !sendMessage.isPending
      : !!text.trim() && !sendMessage.isPending;

  const handleSend = () => {
    if (!canSend) return;
    sendMessage.mutate({
      text: text.trim(),
      channel,
      ...(channel === 'email' && { subject: subject.trim(), attachments }),
    });
    setText('');
    setSubject('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (channel === 'whatsapp' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  if (isLoading)
    return (
      <div className={styles.chatLoading}>
        {[80, 60, 90, 50].map((w, i) => (
          <div
            key={i}
            className={styles.skeletonLine}
            style={{ width: `${w}%`, alignSelf: i % 2 ? 'flex-end' : 'flex-start' }}
          />
        ))}
      </div>
    );
  if (!conv) return null;

  return (
    <div className={styles.chatPanel}>
      {/* Chat header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatHeaderAvatar}>{conv.lead_name.charAt(0)}</div>
          <div>
            <h2 className={styles.chatName}>{conv.lead_name}</h2>
            {conv.lead_company && <p className={styles.chatCompany}>{conv.lead_company}</p>}
          </div>
        </div>
        <div className={styles.chatHeaderRight}>
          <ChannelBadge source={conv.lead_source} />
          {conv.automation_paused && (
            <span className={styles.manualModeBadge}>
              <BotIcon /> Manual Mode
            </span>
          )}
          {!conv.automation_paused && (
            <span className={styles.aiModeBadge}>
              <BotIcon /> AI Active
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {conv.messages.length === 0 ? (
          <p className={styles.emptyMessages}>No messages yet. Send the first one.</p>
        ) : (
          conv.messages.map((msg) => (
            <MessageBubble key={msg.message_id} msg={msg} leadName={conv.lead_name} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputToolbar}>
          {/* Channel tabs — only shown when lead has both channels */}
          {hasBoth && (
            <div className={styles.channelSelector}>
              <button
                className={cn(styles.channelBtn, channel === 'whatsapp' && styles.channelBtnActive)}
                onClick={() => setChannel('whatsapp')}
              >
                <WhatsAppIcon /> WhatsApp
              </button>
              <button
                className={cn(styles.channelBtn, channel === 'email' && styles.channelBtnActive)}
                onClick={() => setChannel('email')}
              >
                <EmailIcon /> Email
              </button>
            </div>
          )}
          {/* Single channel label when no choice */}
          {!hasBoth && (
            <span
              className={cn(styles.channelBtn, styles.channelBtnActive)}
              style={{ cursor: 'default' }}
            >
              {channel === 'whatsapp' ? (
                <>
                  <WhatsAppIcon /> WhatsApp
                </>
              ) : (
                <>
                  <EmailIcon /> Email
                </>
              )}
            </span>
          )}
          {conv.automation_paused && (
            <span className={styles.manualModeNote}>Manual mode — your message, not AI</span>
          )}
        </div>

        {/* Email compose UI */}
        {channel === 'email' ? (
          <div className={styles.emailCompose}>
            <div className={styles.emailField}>
              <span className={styles.emailFieldLabel}>To</span>
              <span className={styles.emailFieldValue}>{conv.lead_email ?? conv.lead_name}</span>
            </div>
            <div className={styles.emailDividerLine} />
            <div className={styles.emailField}>
              <span className={styles.emailFieldLabel}>Subject</span>
              <input
                className={styles.emailSubjectInput}
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className={styles.emailDividerLine} />
            <textarea
              className={styles.emailBodyInput}
              placeholder="Write your email..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
            {attachments.length > 0 && (
              <div className={styles.attachmentList}>
                {attachments.map((f, i) => (
                  <div key={i} className={styles.attachmentChip}>
                    <span className={styles.attachmentName}>{f.name}</span>
                    <button className={styles.attachmentRemove} onClick={() => removeAttachment(i)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.emailFooter}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button className={styles.attachBtn} onClick={() => fileInputRef.current?.click()}>
                <AttachIcon /> Attach
              </button>
              <button className={styles.sendBtnEmail} onClick={handleSend} disabled={!canSend}>
                <SendIcon /> Send
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.inputRow}>
            <textarea
              className={styles.messageInput}
              placeholder="Send via WhatsApp... (Enter to send)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!canSend}>
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, leadName }: { msg: InboxMessage; leadName?: string }) {
  // "assistant" (AI) and "user" (human agent) are both outbound (right side)
  // "lead" = inbound from the lead (left side)
  // For email, also use direction field if present
  // direction is the source of truth; fall back to sender only for assistant
  const isOut = msg.direction ? msg.direction === 'outbound' : msg.sender === 'assistant';
  const isWA = msg.channel === 'whatsapp';
  const isEmail = msg.channel === 'email';

  const leadInitial = leadName ? leadName.charAt(0).toUpperCase() : '?';

  return (
    <div className={cn(styles.msgRow, isOut ? styles.msgRowOut : styles.msgRowIn)}>
      {/* Lead avatar on the left */}
      {!isOut && (
        <div className={styles.msgAvatar} title={leadName}>
          {leadInitial}
        </div>
      )}

      <div className={styles.msgBubbleGroup}>
        {/* Sender label */}
        {!isOut && <span className={styles.msgSenderLabel}>{leadName ?? 'Lead'}</span>}

        <div className={cn(styles.bubble, isOut ? styles.bubbleOut : styles.bubbleIn)}>
          {isEmail && msg.subject && <p className={styles.emailSubject}>{msg.subject}</p>}
          <p className={styles.bubbleText}>{msg.text}</p>
          <div className={styles.bubbleMeta}>
            {msg.is_ai && <span className={styles.aiBadge}>AI</span>}
            {!isOut && (
              <span
                className={cn(styles.channelDotInline, isWA ? styles.msgDotWA : styles.msgDotEmail)}
                title={isWA ? 'WhatsApp' : 'Email'}
              >
                {isWA ? <WhatsAppIcon /> : <EmailIcon />}
              </span>
            )}
            {isEmail && msg.direction && (
              <span className={styles.directionBadge}>
                {msg.direction === 'inbound' ? '↓ received' : '↑ sent'}
              </span>
            )}
            <span className={styles.bubbleTime}>{formatMsgTime(msg.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Spacer on the right for inbound messages */}
      {!isOut && <div className={styles.msgAvatarSpacer} />}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function InboxView({ initialLeadId }: { initialLeadId?: string }) {
  const { data, isLoading } = useInboxConversations();
  const [activeLeadId, setActiveLeadId] = useState<string | null>(initialLeadId ?? null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'email' | 'unread'>('all');

  const conversations = data?.conversations ?? [];
  const unreadTotal = data?.unread_total ?? 0;

  const filtered = conversations.filter((c) => {
    const matchSearch =
      c.lead_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.lead_company ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'whatsapp'
          ? c.lead_source === 'whatsapp'
          : filter === 'email'
            ? c.lead_source === 'email'
            : c.unread_count > 0;
    return matchSearch && matchFilter;
  });

  const activeConv = conversations.find((c) => c.lead_id === activeLeadId) ?? null;

  return (
    <div className={styles.root}>
      {/* ── Left: conversation list ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitleRow}>
            <h1 className={styles.title}>Inbox</h1>
            {unreadTotal > 0 && <span className={styles.unreadTotal}>{unreadTotal}</span>}
          </div>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              className={styles.search}
              placeholder="Search by name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterRow}>
            {(['all', 'whatsapp', 'email', 'unread'] as const).map((f) => (
              <button
                key={f}
                className={cn(styles.filterBtn, filter === f && styles.filterBtnActive)}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.convList}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.convSkeleton} />)
          ) : filtered.length === 0 ? (
            <p className={styles.emptyConvs}>No conversations found.</p>
          ) : (
            filtered.map((conv) => (
              <ConvItem
                key={conv.lead_id}
                conv={conv}
                isActive={activeLeadId === conv.lead_id}
                onClick={() => setActiveLeadId(conv.lead_id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Middle: chat thread ── */}
      <div className={styles.chatArea}>
        {activeLeadId ? (
          <ChatPanel leadId={activeLeadId} />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Select a conversation</h3>
            <p className={styles.emptySubtitle}>
              Full context — WhatsApp, email, meetings, and proposals — all in one place
            </p>
          </div>
        )}
      </div>

      {/* ── Right: lead context panel ── */}
      <div className={styles.contextArea}>
        {activeConv ? (
          <ContextPanel conv={activeConv} />
        ) : (
          <div className={styles.contextEmpty}>
            <p>Select a conversation to see lead context</p>
          </div>
        )}
      </div>
    </div>
  );
}
