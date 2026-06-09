'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './OutreachInbox.module.css';
import { useGenerateBulk, useOutreachInbox, useSyncReplies } from '@/hooks/useOutreach';
import { OutreachThread } from '@/components/campaigns/OutreachThread';
import { OutreachOverview } from '@/components/campaigns/OutreachOverview';
import type { OutreachInboxCreator, OutreachInboxLead } from '@/types/outreach.types';
import { formatRelativeTime, getInitials, negotiationStatusMeta } from '@/lib/outreach';

interface OutreachInboxProps {
  initialLeadId?: string;
  initialCreatorId?: string;
}

type LeadTab = 'influencer' | 'client';
type LeadView = 'conversations' | 'overview';

export const OutreachInbox = ({ initialLeadId, initialCreatorId }: OutreachInboxProps) => {
  const { data, isLoading } = useOutreachInbox();
  const leads = useMemo(() => data?.inbox ?? [], [data]);

  // Pull fresh inbound replies once when the inbox opens. `mutate` is stable, so
  // this fires a single time on mount and refreshes the inbox on success.
  const { mutate: syncReplies } = useSyncReplies();
  useEffect(() => {
    syncReplies();
  }, [syncReplies]);

  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId ?? null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    initialCreatorId ?? null
  );
  const [tab, setTab] = useState<LeadTab>('influencer');
  const [view, setView] = useState<LeadView>('conversations');

  // Deep-link selection (lead/creator from URL) is applied via the initial state
  // above; once the inbox data arrives the lookups below resolve automatically.

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) => l.client_name.toLowerCase().includes(q) || (l.company ?? '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  const selectedLead = leads.find((l) => l.lead_id === selectedLeadId) ?? null;
  const selectedCreator =
    selectedLead?.creators.find((c) => c.creator_id === selectedCreatorId) ?? null;

  function selectLead(lead: OutreachInboxLead) {
    setSelectedLeadId(lead.lead_id);
    setSelectedCreatorId(null);
    setTab('influencer');
    setView('conversations');
  }

  return (
    <div className={styles.root}>
      {/* Pane 1 — Leads */}
      <aside className={styles.leadPane}>
        <div className={styles.leadHeader}>
          <h1 className={styles.title}>Inbox</h1>
          <input
            className={styles.search}
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.leadList}>
          {isLoading ? (
            <div className={styles.muted}>Loading leads…</div>
          ) : filteredLeads.length === 0 ? (
            <div className={styles.muted}>No leads yet</div>
          ) : (
            filteredLeads.map((lead) => (
              <button
                key={lead.lead_id}
                className={`${styles.leadItem} ${selectedLeadId === lead.lead_id ? styles.leadItemActive : ''}`}
                onClick={() => selectLead(lead)}
              >
                <div className={styles.leadAvatar}>{getInitials(lead.client_name)}</div>
                <div className={styles.leadBody}>
                  <div className={styles.leadName}>{lead.client_name}</div>
                  <div className={styles.leadCompany}>{lead.company || '—'}</div>
                  <div className={styles.leadStats}>
                    <span>{lead.total_creators} creators</span>
                  </div>
                </div>
                {lead.total_drafts > 0 && (
                  <span className={styles.draftBadge}>{lead.total_drafts}</span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Pane 2 — Lead detail (tabs + creators).
          Keyed branches so React remounts cleanly instead of morphing one
          <section> subtree into the other (avoids "removeChild of null"). */}
      {selectedLead ? (
        <section key="lead-detail" className={styles.midPane}>
          <div className={styles.midHeader}>
            <div className={styles.midTitleRow}>
              <div>
                <div className={styles.midTitle}>{selectedLead.client_name}</div>
                <div className={styles.midSub}>{selectedLead.company || '—'}</div>
              </div>
            </div>
            <div className={styles.tabBar}>
              <button
                className={`${styles.tab} ${tab === 'influencer' ? styles.tabActive : ''}`}
                onClick={() => setTab('influencer')}
              >
                Influencers
              </button>
              <button
                className={`${styles.tab} ${tab === 'client' ? styles.tabActive : ''}`}
                onClick={() => setTab('client')}
              >
                Clients
              </button>
            </div>

            {tab === 'influencer' && (
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
            <div className={styles.placeholder}>Client conversation — coming soon.</div>
          ) : (
            <div className={styles.creatorList}>
              {selectedLead.creators.length === 0 ? (
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
          <div className={styles.muted}>Select a lead to view its outreach</div>
        </section>
      )}

      {/* Pane 3 — Thread / Overview. Each branch is keyed for a clean remount. */}
      <section className={styles.threadPane}>
        {selectedLead && tab === 'influencer' && view === 'overview' ? (
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
            <span>Select a creator to open the conversation</span>
          </div>
        )}
      </section>
    </div>
  );
};

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
