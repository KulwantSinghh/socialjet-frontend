'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CampaignInboxPage.module.css';
import { useCampaignConversations } from '@/hooks/useCampaignLeads';
import { campaignsService } from '@/services/campaigns.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { InboxConversation } from '@/types/campaign.types';

function SkeletonConv() {
  return (
    <div
      style={{
        padding: 'var(--space-3-5) var(--space-5)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        borderBottom: '1px solid var(--color-border-default)',
      }}
    >
      <div
        className={styles.shimmer}
        style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className={styles.shimmer} style={{ height: 13, width: '55%' }} />
        <div className={styles.shimmer} style={{ height: 11, width: '80%' }} />
      </div>
    </div>
  );
}

function ChatView({ conversation }: { conversation: InboxConversation }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: conv } = useQuery({
    queryKey: ['campaign-conversation', conversation.id],
    queryFn: () => campaignsService.getConversation(conversation.id),
    staleTime: 5_000,
    initialData: conversation,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  async function handleSend() {
    if (!message.trim()) return;
    await campaignsService.sendMessage(conversation.id, message.trim());
    setMessage('');
    qc.invalidateQueries({ queryKey: ['campaign-conversation', conversation.id] });
    qc.invalidateQueries({ queryKey: ['campaign-conversations'] });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  const isInfluencer = conversation.type === 'influencer';

  return (
    <>
      <div className={styles.chatHeader}>
        <div
          className={`${styles.chatHeaderAvatar} ${isInfluencer ? styles.chatHeaderInfluencer : ''}`}
        >
          {getInitials(conversation.participantName)}
        </div>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.chatHeaderName}>{conversation.participantName}</div>
          {conversation.participantHandle && (
            <div className={styles.chatHeaderSub}>@{conversation.participantHandle}</div>
          )}
        </div>
        <span
          className={`${styles.typeBadge} ${isInfluencer ? styles.typeBadgeInfluencer : styles.typeBadgeClient}`}
        >
          {isInfluencer ? 'Influencer' : 'Client'}
        </span>
      </div>

      <div className={styles.messages}>
        {(conv?.messages ?? []).map((msg) => (
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder={`Message ${conversation.participantName}...`}
          value={message}
          rows={1}
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
    </>
  );
}

export function CampaignInboxPage() {
  const [tab, setTab] = useState<'client' | 'influencer'>('client');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useCampaignConversations();

  const filtered = (conversations ?? []).filter((c) => c.type === tab);
  const selected = filtered.find((c) => c.id === selectedId) ?? null;

  const clientUnread = (conversations ?? []).filter(
    (c) => c.type === 'client' && c.unreadCount > 0
  ).length;
  const influencerUnread = (conversations ?? []).filter(
    (c) => c.type === 'influencer' && c.unreadCount > 0
  ).length;

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div className={styles.root}>
      {/* Left sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Inbox</h1>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'client' ? styles.tabActive : ''}`}
              onClick={() => {
                setTab('client');
                setSelectedId(null);
              }}
            >
              Clients
              {clientUnread > 0 && <span className={styles.tabBadge}>{clientUnread}</span>}
            </button>
            <button
              className={`${styles.tab} ${tab === 'influencer' ? styles.tabActive : ''}`}
              onClick={() => {
                setTab('influencer');
                setSelectedId(null);
              }}
            >
              Influencers
              {influencerUnread > 0 && <span className={styles.tabBadge}>{influencerUnread}</span>}
            </button>
          </div>
        </div>

        <div className={styles.convList}>
          {isLoading
            ? [1, 2, 3, 4, 5].map((i) => <SkeletonConv key={i} />)
            : filtered.map((conv) => (
                <button
                  key={conv.id}
                  className={`${styles.convItem} ${selectedId === conv.id ? styles.convItemActive : ''}`}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <div
                    className={`${styles.convAvatar} ${conv.type === 'influencer' ? styles.convAvatarInfluencer : ''}`}
                  >
                    {getInitials(conv.participantName)}
                    {conv.unreadCount > 0 && <div className={styles.unreadDot} />}
                  </div>
                  <div className={styles.convContent}>
                    <div className={styles.convTopRow}>
                      <span className={styles.convName}>{conv.participantName}</span>
                      <span className={styles.convTime}>
                        {new Date(conv.lastMessageAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div
                      className={`${styles.convLastMsg} ${conv.unreadCount > 0 ? styles.convLastMsgUnread : ''}`}
                    >
                      {conv.lastMessage}
                    </div>
                  </div>
                </button>
              ))}
          {!isLoading && !filtered.length && (
            <div
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
              }}
            >
              No {tab} conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={styles.chatArea}>
        {selected ? (
          <ChatView key={selected.id} conversation={selected} />
        ) : (
          <div className={styles.chatEmpty}>
            <div className={styles.chatEmptyIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span>Select a conversation to start messaging</span>
          </div>
        )}
      </div>
    </div>
  );
}
