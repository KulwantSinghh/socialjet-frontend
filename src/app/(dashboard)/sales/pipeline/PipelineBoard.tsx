'use client';

import { useRouter } from 'next/navigation';
import { useLeads } from '@/hooks/useLeads';
import type { Lead } from '@/types/leads.types';
import styles from './PipelineBoard.module.css';
import { cn } from '@/lib/utils';

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'new',
    label: 'New Leads',
    statuses: ['new'],
    color: '#6c63ff',
    bg: 'rgba(108,99,255,0.08)',
  },
  {
    key: 'nurturing',
    label: 'Nurturing',
    statuses: ['contacted', 'nurture'],
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    key: 'meeting',
    label: 'Meeting',
    statuses: ['qualified', 'meeting_booked'],
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    key: 'proposal',
    label: 'Proposal',
    statuses: ['proposal', 'proposal_ready', 'proposal_sent'],
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
  },
  {
    key: 'closed',
    label: 'Closed Won',
    statuses: ['closed'],
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    key: 'dead',
    label: 'Dead',
    statuses: ['canceled'],
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WA',
  contact_form: 'Form',
  calendly: 'Cal',
  manual: 'Manual',
};

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: '#25d366',
  contact_form: '#3b82f6',
  calendly: '#006bff',
  manual: '#6b7280',
};

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const days = daysSince(lead.updated_at);
  const srcLabel = SOURCE_LABELS[lead.source] ?? lead.source;
  const srcColor = SOURCE_COLORS[lead.source] ?? '#6b7280';

  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.cardAvatar}>{lead.name.charAt(0).toUpperCase()}</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardName}>{lead.name}</span>
          {lead.company && <span className={styles.cardCompany}>{lead.company}</span>}
        </div>
      </div>

      <div className={styles.cardMeta}>
        <span
          className={styles.sourceTag}
          style={{
            background: `${srcColor}15`,
            color: srcColor,
            border: `1px solid ${srcColor}30`,
          }}
        >
          {srcLabel}
        </span>
        {lead.status === 'proposal_ready' && (
          <span className={cn(styles.proposalFlag, styles.proposalFlagReady)}>Ready</span>
        )}
        {lead.status === 'proposal_sent' && (
          <span className={cn(styles.proposalFlag, styles.proposalFlagSent)}>Sent</span>
        )}
        <span
          className={cn(
            styles.daysTag,
            days > 14 && styles.daysTagWarning,
            days > 30 && styles.daysTagDanger
          )}
        >
          {days}d
        </span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>{formatDate(lead.updated_at)}</span>
        {lead.deal_value && (
          <span className={styles.dealValue}>${Number(lead.deal_value).toLocaleString()}</span>
        )}
      </div>
    </button>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({
  col,
  leads,
  onCardClick,
}: {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  onCardClick: (id: string) => void;
}) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader} style={{ borderTopColor: col.color }}>
        <div className={styles.columnTitleRow}>
          <span className={styles.columnLabel} style={{ color: col.color }}>
            {col.label}
          </span>
          <span className={styles.columnCount} style={{ background: col.bg, color: col.color }}>
            {leads.length}
          </span>
        </div>
      </div>

      <div className={styles.columnBody}>
        {leads.length === 0 ? (
          <div className={styles.columnEmpty}>No leads here</div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.lead_id} lead={lead} onClick={() => onCardClick(lead.lead_id)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────
export function PipelineBoard() {
  const router = useRouter();
  const { data, isLoading } = useLeads();

  const leads = data?.leads ?? [];

  const grouped = COLUMNS.reduce<Record<string, Lead[]>>((acc, col) => {
    acc[col.key] = leads.filter((l) => col.statuses.includes(l.status as never));
    return acc;
  }, {});

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pipeline</h1>
          <p className={styles.subtitle}>
            {leads.length} total leads · Click any card to view the full lead journey
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.columnSkeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.board}>
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              col={col}
              leads={grouped[col.key] ?? []}
              onCardClick={(id) => router.push(`/sales/leads/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
