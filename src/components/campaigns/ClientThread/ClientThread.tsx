'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../OutreachThread/OutreachThread.module.css';
import { useClientConversationThread, useSendClientMessage } from '@/hooks/useClientConversation';
import type {
  ClientConversationMessage,
  ClientInboxConversation,
} from '@/types/clientConversation.types';
import {
  clientMessageKey,
  clientMessageStatusMeta,
  clientMessageTypeLabel,
} from '@/lib/clientConversation';
import { formatTime, getInitials } from '@/lib/outreach';

export interface ClientThreadProps {
  leadId: string;
  preview?: ClientInboxConversation | null;
  onBack?: () => void;
}

export const ClientThread = ({ leadId, preview, onBack }: ClientThreadProps) => {
  const { data: thread, isLoading } = useClientConversationThread(leadId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clientName = thread?.client_name ?? preview?.client_name ?? 'Client';
  const company = thread?.company ?? preview?.company ?? '';
  const clientEmail = thread?.client_email ?? '';

  const messages = useMemo(() => thread?.messages ?? [], [thread?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="Back">
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
          <span>{getInitials(clientName)}</span>
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>{clientName}</div>
          <div className={styles.headerSub}>
            {company && <span>{company}</span>}
            {clientEmail && company && <span className={styles.dot}>·</span>}
            {clientEmail && <span>{clientEmail}</span>}
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={`${styles.badge} ${styles.tone_neutral}`}>Client</span>
        </div>
      </header>

      <div className={styles.messages}>
        {isLoading ? (
          <div className={styles.loading}>Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            No messages yet. Send an email to start the conversation.
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={clientMessageKey(msg, index)} msg={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <Composer leadId={leadId} />
    </div>
  );
};

function MessageBubble({ msg }: { msg: ClientConversationMessage }) {
  const isInbound = msg.direction === 'inbound';
  const statusMeta = clientMessageStatusMeta(msg.status);

  return (
    <div className={`${styles.row} ${isInbound ? styles.rowInbound : styles.rowOutbound}`}>
      <div
        className={`${styles.bubble} ${isInbound ? styles.bubbleInbound : styles.bubbleOutbound}`}
      >
        <div className={styles.bubbleTop}>
          <span className={styles.typeTag}>{clientMessageTypeLabel(msg.message_type)}</span>
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

        <div className={styles.content}>{msg.content}</div>

        <div className={styles.bubbleFooter}>
          <span>{formatTime(msg.created_at)}</span>
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
      </div>
    </div>
  );
}

function Composer({ leadId }: { leadId: string }) {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const send = useSendClientMessage(leadId);

  function handleSend() {
    if (!text.trim()) return;
    send.mutate(
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
          placeholder="Write a reply — sends to the client by email…"
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
          disabled={send.isPending || !text.trim()}
          title="Send email"
        >
          {send.isPending ? (
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
