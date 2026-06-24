'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './OutreachInbox.module.css';
import { useGenerateBulk, useOutreachInbox, useSyncReplies } from '@/hooks/useOutreach';
import {
  clientConversationKeys,
  useClientConversationInbox,
  useSyncClientReplies,
} from '@/hooks/useClientConversation';
import { OutreachThread } from '@/components/campaigns/OutreachThread';
import { ClientThread } from '@/components/campaigns/ClientThread';
import { OutreachOverview } from '@/components/campaigns/OutreachOverview';
import type { OutreachInboxCreator } from '@/types/outreach.types';
import type { ClientInboxConversation } from '@/types/clientConversation.types';
import { formatRelativeTime, getInitials, negotiationStatusMeta } from '@/lib/outreach';

interface OutreachInboxProps {
  initialLeadId?: string;
  initialCreatorId?: string;
}

type LeadTab = 'client' | 'influencer';
type LeadView = 'conversations' | 'overview';

export const OutreachInbox = ({ initialLeadId, initialCreatorId }: OutreachInboxProps) => {
  const qc = useQueryClient();
  // Outreach inbox is kept for the per-client influencer (creator) lists, joined
  // to the selected client conversation by lead_id.
  const { data } = useOutreachInbox();
  const { data: clientInbox, isLoading } = useClientConversationInbox();
  const leads = useMemo(() => data?.inbox ?? [], [data]);

  const clientConversations = useMemo(() => clientInbox?.conversations ?? [], [clientInbox]);

  // Pull fresh inbound replies once when the inbox opens. `mutate` is stable, so
  // this fires a single time on mount and refreshes the inbox on success.
  const { mutate: syncReplies } = useSyncReplies();
  const { mutate: syncClientReplies } = useSyncClientReplies();

  useEffect(() => {
    syncReplies();
    syncClientReplies();
  }, [syncReplies, syncClientReplies]);

  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId ?? null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    initialCreatorId ?? null
  );
  // Client communication is the entry point — open a client on its email thread,
  // and surface that client's influencers under a secondary tab.
  const [tab, setTab] = useState<LeadTab>('client');
  const [view, setView] = useState<LeadView>('conversations');

  // Deep-link selection (lead/creator from URL) is applied via the initial state
  // above; once the inbox data arrives the lookups below resolve automatically.

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientConversations;
    return clientConversations.filter(
      (c) => c.client_name.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q)
    );
  }, [clientConversations, search]);

  const selectedConversation = useMemo(
    () => clientConversations.find((c) => c.lead_id === selectedLeadId) ?? null,
    [clientConversations, selectedLeadId]
  );
  // Matching outreach lead supplies the influencer creators for the secondary tab.
  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId) ?? null;
  const selectedCreator =
    selectedLead?.creators.find((c) => c.creator_id === selectedCreatorId) ?? null;

  // Sync client replies when a client conversation is open, then refresh its thread.
  useEffect(() => {
    if (tab !== 'client' || !selectedLeadId) return;
    syncClientReplies(undefined, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: clientConversationKeys.thread(selectedLeadId) });
      },
    });
  }, [tab, selectedLeadId, syncClientReplies, qc]);

  function selectClient(conversation: ClientInboxConversation) {
    setSelectedLeadId(conversation.lead_id);
    setSelectedCreatorId(null);
    setTab('client');
    setView('conversations');
  }

  function openInfluencerTab() {
    setTab('influencer');
    setSelectedCreatorId(null);
    setView('conversations');
  }

  const headerName = selectedConversation?.client_name ?? selectedLead?.client_name ?? '';
  const headerCompany = selectedConversation?.company ?? selectedLead?.company ?? '';

  return (
    <div className={styles.root}>
      {/* Pane 1 — Client conversations (entry point) */}
      <aside className={styles.leadPane}>
        <div className={styles.leadHeader}>
          <h1 className={styles.title}>Inbox</h1>
          <input
            className={styles.search}
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.leadList}>
          {isLoading ? (
            <div className={styles.muted}>Loading clients…</div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.muted}>No client conversations yet</div>
          ) : (
            filteredConversations.map((conv) => {
              const awaitingUs = conv.last_direction === 'inbound';
              return (
                <button
                  key={conv.lead_id}
                  className={`${styles.leadItem} ${selectedLeadId === conv.lead_id ? styles.leadItemActive : ''}`}
                  onClick={() => selectClient(conv)}
                >
                  <div className={styles.leadAvatar}>{getInitials(conv.client_name)}</div>
                  <div className={styles.leadBody}>
                    <div className={styles.leadName}>{conv.client_name}</div>
                    <div className={styles.leadCompany}>{conv.company || '—'}</div>
                    {conv.last_message && (
                      <div className={styles.leadStats}>
                        <span>{conv.last_message}</span>
                      </div>
                    )}
                  </div>
                  {awaitingUs && <span className={styles.draftBadge}>New</span>}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Pane 2 — Client detail (tabs: Clients default, Influencers secondary).
          Keyed branches so React remounts cleanly instead of morphing one
          <section> subtree into the other (avoids "removeChild of null"). */}
      {selectedConversation || selectedLead ? (
        <section key="lead-detail" className={styles.midPane}>
          <div className={styles.midHeader}>
            <div className={styles.midTitleRow}>
              <div>
                <div className={styles.midTitle}>{headerName || '—'}</div>
                <div className={styles.midSub}>{headerCompany || '—'}</div>
              </div>
            </div>
            <div className={styles.tabBar}>
              <button
                className={`${styles.tab} ${tab === 'client' ? styles.tabActive : ''}`}
                onClick={() => setTab('client')}
              >
                Clients
              </button>
              <button
                className={`${styles.tab} ${tab === 'influencer' ? styles.tabActive : ''}`}
                onClick={openInfluencerTab}
              >
                Influencers
              </button>
            </div>

            {tab === 'influencer' && selectedLead && (
              <div className={styles.subControls}>
                <div className={styles.segmented}>
                  <button
                    className={`${styles.segBtn} ${view === 'conversations' ? styles.segActive : ''}`}
                    onClick={() => setView('conversations')}
                  >
                    Conversations
                  </button>
                  <button
                    className={`${styles.segBtn} ${view === 'overview' ? styles.segActive : ''}`}
                    onClick={() => setView('overview')}
                  >
                    Overview
                  </button>
                </div>
                <BulkGenerate leadId={selectedLead.lead_id} />
              </div>
            )}
          </div>

          {tab === 'client' ? (
            <div className={styles.creatorList}>
              {selectedConversation ? (
                <ClientRow conversation={selectedConversation} active />
              ) : (
                <div className={styles.muted}>No client conversation yet</div>
              )}
            </div>
          ) : (
            <div className={styles.creatorList}>
              {!selectedLead || selectedLead.creators.length === 0 ? (
                <div className={styles.muted}>No client-approved creators yet</div>
              ) : (
                selectedLead.creators.map((c) => (
                  <CreatorRow
                    key={c.creator_id}
                    creator={c}
                    active={selectedCreatorId === c.creator_id && view === 'conversations'}
                    onClick={() => {
                      setSelectedCreatorId(c.creator_id);
                      setView('conversations');
                    }}
                  />
                ))
              )}
            </div>
          )}
        </section>
      ) : (
        <section key="lead-empty" className={styles.midPaneEmpty}>
          <div className={styles.muted}>Select a client to view its communication</div>
        </section>
      )}

      {/* Pane 3 — Thread / Overview. Each branch is keyed for a clean remount. */}
      <section className={styles.threadPane}>
        {selectedConversation && tab === 'client' ? (
          <ClientThread
            key={`client:${selectedConversation.lead_id}`}
            leadId={selectedConversation.lead_id}
            preview={selectedConversation}
          />
        ) : selectedLead && tab === 'influencer' && view === 'overview' ? (
          <OutreachOverview key="overview" leadId={selectedLead.lead_id} />
        ) : selectedLead && selectedCreator && view === 'conversations' ? (
          <OutreachThread
            key={`thread:${selectedLead.lead_id}:${selectedCreator.creator_id}`}
            leadId={selectedLead.lead_id}
            creator={selectedCreator}
            onBack={() => setSelectedCreatorId(null)}
          />
        ) : (
          <div key="thread-empty" className={styles.threadEmpty}>
            <div className={styles.threadEmptyIcon}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span>
              {tab === 'client'
                ? 'Select a client to open the conversation'
                : 'Select a creator to open the conversation'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

function ClientRow({
  conversation,
  active,
}: {
  conversation: ClientInboxConversation;
  active: boolean;
}) {
  const awaitingUs = conversation.last_direction === 'inbound';
  const preview = conversation.last_message;
  const previewTime = conversation.last_at;

  return (
    <div
      className={`${styles.creatorItem} ${active ? styles.creatorItemActive : ''} ${
        awaitingUs ? styles.creatorItemAwaiting : ''
      }`}
    >
      <div className={styles.creatorAvatar}>
        <span>{getInitials(conversation.client_name)}</span>
      </div>
      <div className={styles.creatorBody}>
        <div className={styles.creatorTop}>
          <span className={styles.creatorName}>{conversation.client_name}</span>
          {previewTime && (
            <span className={styles.creatorTime}>{formatRelativeTime(previewTime)}</span>
          )}
        </div>
        <div className={styles.creatorHandle}>{conversation.company || '—'}</div>
        {preview ? (
          <div className={styles.creatorPreview}>{preview}</div>
        ) : (
          <div className={styles.creatorPreview}>No messages yet</div>
        )}
        <div className={styles.creatorTags}>
          {awaitingUs && <span className={styles.newReplyPill}>New Reply</span>}
          <span className={`${styles.statusPill} ${styles.tone_neutral}`}>Client</span>
        </div>
      </div>
    </div>
  );
}

function CreatorRow({
  creator,
  active,
  onClick,
}: {
  creator: OutreachInboxCreator;
  active: boolean;
  onClick: () => void;
}) {
  const meta = negotiationStatusMeta(creator.negotiation_status);
  const awaitingUs = creator.last_direction === 'inbound';
  return (
    <button
      className={`${styles.creatorItem} ${active ? styles.creatorItemActive : ''} ${
        awaitingUs ? styles.creatorItemAwaiting : ''
      }`}
      onClick={onClick}
    >
      <div className={styles.creatorAvatar}>
        {creator.profile_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key="img" src={creator.profile_image} alt={creator.creator_name} />
        ) : (
          <span key="initials">{getInitials(creator.creator_name)}</span>
        )}
      </div>
      <div className={styles.creatorBody}>
        <div className={styles.creatorTop}>
          <span className={styles.creatorName}>{creator.creator_name}</span>
          <span className={styles.creatorTime}>{formatRelativeTime(creator.last_message_at)}</span>
        </div>
        <div className={styles.creatorHandle}>@{creator.creator_handle}</div>
        {creator.last_message && (
          <div className={styles.creatorPreview}>{creator.last_message}</div>
        )}
        <div className={styles.creatorTags}>
          {creator.has_unread_reply && <span className={styles.newReplyPill}>New Reply</span>}
          <span className={`${styles.statusPill} ${styles[`tone_${meta.tone}`]}`}>
            {meta.label}
          </span>
          {creator.draft_count > 0 && (
            <span className={styles.draftPill}>
              {creator.draft_count} draft{creator.draft_count > 1 ? 's' : ''}
            </span>
          )}
          {creator.reply_count != null && creator.reply_count > 0 && (
            <span className={styles.msgCount}>
              {creator.reply_count} repl{creator.reply_count > 1 ? 'ies' : 'y'}
            </span>
          )}
          {creator.total_messages > 0 && (
            <span className={styles.msgCount}>{creator.total_messages} msg</span>
          )}
        </div>
      </div>
    </button>
  );
}

function BulkGenerate({ leadId }: { leadId: string }) {
  const bulk = useGenerateBulk(leadId);
  return (
    <button
      className={styles.bulkBtn}
      disabled={bulk.isPending}
      title="Generate outreach drafts for all approved creators"
      onClick={() => bulk.mutate(undefined)}
    >
      {bulk.isPending ? 'Generating…' : 'Generate all'}
    </button>
  );
}
