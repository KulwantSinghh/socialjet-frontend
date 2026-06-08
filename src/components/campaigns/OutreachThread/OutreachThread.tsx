'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './OutreachThread.module.css';
import {
  useApproveMessage,
  useComposeMessage,
  useNegotiate,
  useOutreachThread,
  useRejectMessage,
  useSendBrief,
  useSendMessage,
  useUpdateNegotiationStatus,
} from '@/hooks/useOutreach';
import type {
  NegotiationStatus,
  OutreachInboxCreator,
  OutreachMessage,
} from '@/types/outreach.types';
import {
  formatMoney,
  formatTime,
  getInitials,
  messageStatusMeta,
  messageTypeLabel,
  negotiationStatusMeta,
  NEGOTIATION_STATUS_OPTIONS,
} from '@/lib/outreach';

interface OutreachThreadProps {
  leadId: string;
  creator: OutreachInboxCreator;
  onBack?: () => void;
}

type ComposerMode = 'reply' | 'log';

export const OutreachThread = ({ leadId, creator, onBack }: OutreachThreadProps) => {
  const creatorId = creator.creator_id;
  const { data, isLoading } = useOutreachThread(leadId, creatorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendBrief = useSendBrief(leadId, creatorId);
  const updateStatus = useUpdateNegotiationStatus(leadId, creatorId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const messages = data?.messages ?? [];
  const statusMeta = negotiationStatusMeta(creator.negotiation_status);
  const canSendBrief =
    creator.negotiation_status === 'interested' || creator.negotiation_status === 'confirmed';

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="Back to creators">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className={styles.avatar}>
          {creator.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key="img" src={creator.profile_image} alt={creator.creator_name} />
          ) : (
            <span key="initials">{getInitials(creator.creator_name)}</span>
          )}
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>{creator.creator_name}</div>
          <div className={styles.headerSub}>
            {creator.creator_handle && <span>@{creator.creator_handle}</span>}
            {creator.creator_email && <span className={styles.dot}>·</span>}
            {creator.creator_email && <span>{creator.creator_email}</span>}
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={`${styles.badge} ${styles[`tone_${statusMeta.tone}`]}`}>
            {statusMeta.label}
          </span>
          {creator.deal_amount != null && (
            <span className={styles.dealAmount}>{formatMoney(creator.deal_amount)}</span>
          )}
        </div>
      </header>

      {/* Action bar */}
      <div className={styles.actionBar}>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          disabled={!canSendBrief || sendBrief.isPending}
          title={
            canSendBrief
              ? 'Send the KOL brief to this creator'
              : 'Available once interested/confirmed'
          }
          onClick={() => sendBrief.mutate()}
        >
          {sendBrief.isPending ? 'Sending brief…' : 'Send KOL Brief'}
        </button>
        <label className={styles.statusSelect}>
          <span>Status</span>
          <select
            value={creator.negotiation_status}
            onChange={(e) =>
              updateStatus.mutate({ negotiation_status: e.target.value as NegotiationStatus })
            }
            disabled={updateStatus.isPending}
          >
            {NEGOTIATION_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {negotiationStatusMeta(opt).label}
              </option>
            ))}
          </select>
        </label>
        {sendBrief.isSuccess && <span className={styles.flashOk}>Brief sent ✓</span>}
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {isLoading ? (
          <div className={styles.loading}>Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. A draft will appear once generated.</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.message_id} leadId={leadId} creatorId={creatorId} msg={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <Composer leadId={leadId} creatorId={creatorId} channel={messages[0]?.channel ?? 'email'} />
    </div>
  );
};

// ── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  leadId,
  creatorId,
  msg,
}: {
  leadId: string;
  creatorId: string;
  msg: OutreachMessage;
}) {
  const approve = useApproveMessage(leadId, creatorId);
  const reject = useRejectMessage(leadId, creatorId);
  const retry = useSendMessage(leadId, creatorId);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.draft_content);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isInbound = msg.direction === 'inbound';
  const isDraft = msg.status === 'draft';
  const isSending = msg.status === 'approved' || msg.status === 'edited';
  const isRejected = msg.status === 'rejected';
  const statusMeta = messageStatusMeta(msg.status);
  const content = msg.final_content || msg.draft_content;

  const hasNegotiationMeta =
    msg.message_type === 'negotiation' &&
    (msg.offer_amount != null || msg.negotiation_round != null || msg.intent_detected != null);

  return (
    <div className={`${styles.row} ${isInbound ? styles.rowInbound : styles.rowOutbound}`}>
      <div
        className={`${styles.bubble} ${isInbound ? styles.bubbleInbound : styles.bubbleOutbound} ${
          isDraft ? styles.bubbleDraft : ''
        }`}
      >
        <div className={styles.bubbleTop}>
          <span className={styles.typeTag}>{messageTypeLabel(msg.message_type)}</span>
          {!isInbound && (
            <span className={`${styles.statusTag} ${styles[`tone_${statusMeta.tone}`]}`}>
              {statusMeta.label}
            </span>
          )}
        </div>

        {msg.subject && <div className={styles.subject}>{msg.subject}</div>}

        {editing ? (
          <textarea
            className={styles.editArea}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={5}
          />
        ) : (
          <div className={styles.content}>{content}</div>
        )}

        {hasNegotiationMeta && (
          <div className={styles.negMeta}>
            {msg.negotiation_round != null && (
              <span className={styles.negChip}>Round {msg.negotiation_round + 1}</span>
            )}
            {msg.offer_amount != null && (
              <span className={styles.negChip}>
                Offer {formatMoney(msg.offer_amount)}
                {msg.offer_percentage != null ? ` · ${msg.offer_percentage}%` : ''}
              </span>
            )}
            {msg.intent_detected && (
              <span className={styles.negChip}>Intent: {msg.intent_detected}</span>
            )}
            {msg.escalate && (
              <span className={`${styles.negChip} ${styles.negEscalate}`}>Escalate</span>
            )}
          </div>
        )}

        {isRejected && msg.rejected_reason && (
          <div className={styles.rejectReason}>Rejected: {msg.rejected_reason}</div>
        )}

        <div className={styles.bubbleFooter}>
          <span>{formatTime(msg.sent_at || msg.created_at)}</span>
          {msg.status === 'sent' && (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </div>

        {/* Draft actions */}
        {isDraft && !rejecting && (
          <div className={styles.draftActions}>
            {editing ? (
              <>
                <button
                  className={`${styles.draftBtn} ${styles.draftApprove}`}
                  disabled={approve.isPending}
                  onClick={() =>
                    approve.mutate(
                      { messageId: msg.message_id, payload: { edited_content: editValue } },
                      { onSuccess: () => setEditing(false) }
                    )
                  }
                >
                  Save &amp; Approve
                </button>
                <button className={styles.draftBtn} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className={`${styles.draftBtn} ${styles.draftApprove}`}
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ messageId: msg.message_id })}
                >
                  {approve.isPending ? 'Approving…' : 'Approve & Send'}
                </button>
                <button className={styles.draftBtn} onClick={() => setEditing(true)}>
                  Edit
                </button>
                <button
                  className={`${styles.draftBtn} ${styles.draftReject}`}
                  onClick={() => setRejecting(true)}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}

        {/* Reject reason input */}
        {isDraft && rejecting && (
          <div className={styles.rejectBox}>
            <input
              className={styles.rejectInput}
              placeholder="Reason (optional) — e.g. too formal, regenerate"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.draftActions}>
              <button
                className={`${styles.draftBtn} ${styles.draftReject}`}
                disabled={reject.isPending}
                onClick={() =>
                  reject.mutate(
                    {
                      messageId: msg.message_id,
                      payload: rejectReason ? { reason: rejectReason } : undefined,
                    },
                    { onSuccess: () => setRejecting(false) }
                  )
                }
              >
                {reject.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button className={styles.draftBtn} onClick={() => setRejecting(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Retry for stuck approved/edited messages */}
        {isSending && (
          <div className={styles.draftActions}>
            <button
              className={styles.draftBtn}
              disabled={retry.isPending}
              onClick={() => retry.mutate(msg.message_id)}
            >
              {retry.isPending ? 'Retrying…' : 'Retry send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composer ──────────────────────────────────────────────────────────────

function Composer({
  leadId,
  creatorId,
  channel,
}: {
  leadId: string;
  creatorId: string;
  channel: string;
}) {
  const [mode, setMode] = useState<ComposerMode>('reply');
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');

  const compose = useComposeMessage(leadId, creatorId);
  const negotiate = useNegotiate(leadId, creatorId);
  const isEmail = channel === 'email';

  function handleSend() {
    if (!text.trim()) return;
    if (mode === 'reply') {
      compose.mutate(
        {
          content: text.trim(),
          subject: isEmail && subject.trim() ? subject.trim() : undefined,
          auto_send: true,
        },
        {
          onSuccess: () => {
            setText('');
            setSubject('');
          },
        }
      );
    } else {
      negotiate.mutate({ creator_reply: text.trim() }, { onSuccess: () => setText('') });
    }
  }

  const pending = compose.isPending || negotiate.isPending;

  return (
    <div className={styles.composer}>
      <div className={styles.composerTabs}>
        <button
          className={`${styles.composerTab} ${mode === 'reply' ? styles.composerTabActive : ''}`}
          onClick={() => setMode('reply')}
        >
          Reply as us
        </button>
        <button
          className={`${styles.composerTab} ${mode === 'log' ? styles.composerTabActive : ''}`}
          onClick={() => setMode('log')}
        >
          Log creator reply → AI counter
        </button>
      </div>

      {mode === 'reply' && isEmail && (
        <input
          className={styles.subjectInput}
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      )}

      <div className={styles.composerRow}>
        <textarea
          className={styles.composerInput}
          rows={1}
          placeholder={
            mode === 'reply'
              ? 'Write a message — sends immediately…'
              : "Paste the creator's reply — AI drafts a counter-offer for your approval…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={pending || !text.trim()}
          title={mode === 'reply' ? 'Send' : 'Generate counter-offer'}
        >
          {pending ? (
            '…'
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
              <path d="M22 2 11 13" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
