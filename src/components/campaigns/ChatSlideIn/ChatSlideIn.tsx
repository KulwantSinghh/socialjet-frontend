'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatSlideIn.module.css';
import { campaignsService } from '@/services/campaigns.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Props {
  leadId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSlideIn({ leadId, clientName, isOpen, onClose }: Props) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['lead-client-conversation', leadId],
    queryFn: () => campaignsService.getLeadClientConversation(leadId),
    staleTime: 5_000,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, conversation?.messages]);

  async function handleSend() {
    if (!message.trim() || !conversation) return;
    await campaignsService.sendMessage(conversation.id, message.trim());
    setMessage('');
    qc.invalidateQueries({ queryKey: ['lead-client-conversation', leadId] });
  }

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
      <div
        className={styles.panel}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className={styles.header}>
          <div className={styles.avatar}>{getInitials(clientName)}</div>
          <div className={styles.headerInfo}>
            <div className={styles.headerName}>{clientName}</div>
            <div className={styles.headerSub}>Client</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.messages}>
          {(conversation?.messages ?? []).length === 0 ? (
            <div className={styles.emptyMessages}>No messages yet</div>
          ) : (
            (conversation?.messages ?? []).map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  className={`${styles.messageBubble} ${msg.isOwn ? styles.bubbleOwn : styles.bubbleOther}`}
                >
                  {msg.content}
                  <div className={styles.messageTime}>
                    {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
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
          </button>
        </div>
      </div>
    </>
  );
}
