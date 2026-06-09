'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './OutreachThread.module.css';
import {
  outreachKeys,
  useApproveMessage,
  useCreatorConversation,
  useNegotiate,
  useRejectMessage,
  useReply,
  useSendBrief,
  useSendMessage,
  useSyncReplies,
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

export const OutreachThread = ({ leadId, creator, onBack }: OutreachThreadProps) => {
  const creatorId = creator.creator_id;
  const qc = useQueryClient();
  const { messages, isLoading, emailFetchedAt } = useCreatorConversation(leadId, creatorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendBrief = useSendBrief(leadId, creatorId);
  const updateStatus = useUpdateNegotiationStatus(leadId, creatorId);

  // Step 5 — Negotiation. When a creator reply lands, the backend generates a
  // counter-offer draft. `creator_reply` is taken from the synced inbound
  // message, so the CM never re-pastes text already in the thread.
  const negotiate = useNegotiate(leadId, creatorId);
  const { mutate: runNegotiate, isPending: negotiating } = negotiate;

  // Auto-generate a draft the moment a new, unanswered creator reply appears.
  // Replies we've already handled are tracked so a draft is generated exactly
  // once per reply, even across the thread's polling refetches.
  const autoNegotiatedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (negotiating || messages.length === 0) return;
    const last = messages[messages.length - 1];
    // A draft is only owed when the latest message is an unanswered creator
    // reply — once a draft/outbound message follows it, we've responded.
    if (last.direction !== 'inbound') return;
    if (autoNegotiatedRef.current.has(last.message_id)) return;
    const replyText = (last.final_content || last.draft_content || '').trim();
    if (!replyText) return;
    autoNegotiatedRef.current.add(last.message_id);
    runNegotiate({ creator_reply: replyText });
  }, [messages, negotiating, runNegotiate]);

  const handleNegotiate = (reply: string) => {
    const text = reply.trim();
    if (!text) return;
    runNegotiate({ creator_reply: text });
  };

  // Backend only surfaces creator replies in /thread AFTER a sync. So on opening
  // a conversation, pull replies first, then refetch this thread so they appear.
  const { mutate: syncReplies } = useSyncReplies();
  useEffect(() => {
    syncReplies(undefined, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: outreachKeys.emailThread(leadId, creatorId) });
        qc.invalidateQueries({ queryKey: outreachKeys.thread(leadId, creatorId) });
      },
    });
  }, [syncReplies, qc, leadId, creatorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetching the email thread clears has_unread_reply server-side; refresh the
  // inbox once that fetch lands so the "New Reply" badge drops.
  useEffect(() => {
    if (emailFetchedAt) {
      qc.invalidateQueries({ queryKey: outreachKeys.inbox() });
    }
  }, [emailFetchedAt, qc]);

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
          <div key="loading" className={styles.loading}>
            Loading conversation…
          </div>
        ) : messages.length === 0 ? (
          <div key="empty" className={styles.empty}>
            No messages yet. A draft will appear once generated.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.message_id}
              leadId={leadId}
              creatorId={creatorId}
              msg={msg}
              onNegotiate={handleNegotiate}
              negotiating={negotiating}
            />
          ))
        )}
        {negotiating && (
          <div key="neg-status" className={styles.negStatus}>
            Generating AI counter-offer…
          </div>
        )}
        {negotiate.isError && (
          <div key="neg-error" className={styles.negError}>
            Couldn’t generate a counter-offer. Use “Generate AI counter-offer” to retry.
          </div>
        )}
        <div key="end" ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <Composer leadId={leadId} creatorId={creatorId} />
    </div>
  );
};

// ── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({
  leadId,
  creatorId,
  msg,
  onNegotiate,
  negotiating,
}: {
  leadId: string;
  creatorId: string;
  msg: OutreachMessage;
  onNegotiate: (reply: string) => void;
  negotiating: boolean;
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
        {isInbound && msg.from_email && (
          <div className={styles.fromEmail}>from {msg.from_email}</div>
        )}

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

        {/* Inbound reply — generate an AI counter-offer from this message.
            A draft is auto-generated for the latest reply; this button covers
            regenerating or responding to an earlier reply. */}
        {isInbound && content.trim() && (
          <div className={styles.draftActions}>
            <button
              className={`${styles.draftBtn} ${styles.negotiateBtn}`}
              disabled={negotiating}
              onClick={() => onNegotiate(content)}
            >
              {negotiating ? 'Generating…' : 'Generate AI counter-offer'}
            </button>
          </div>
        )}

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

function Composer({ leadId, creatorId }: { leadId: string; creatorId: string }) {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');

  const reply = useReply(leadId, creatorId);

  function handleSend() {
    if (!text.trim()) return;
    reply.mutate(
      {
        content: text.trim(),
        subject: subject.trim() ? subject.trim() : undefined,
      },
      {
        onSuccess: () => {
          setText('');
          setSubject('');
        },
      }
    );
  }

  const pending = reply.isPending;

  return (
    <div className={styles.composer}>
      <input
        className={styles.subjectInput}
        placeholder="Subject (optional)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <div className={styles.composerRow}>
        <textarea
          className={styles.composerInput}
          rows={1}
          placeholder="Write a reply — sends to the creator by email…"
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
          title="Send reply"
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
