'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLeads, useUpdateLeadStatus } from '@/hooks/useLeads';
import type { Lead } from '@/types/leads.types';
import styles from './PipelineBoard.module.css';
import { cn } from '@/lib/utils';

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'new',
    label: 'New Leads',
    statuses: ['new'],
    dropStatus: 'new',
    color: '#6c63ff',
    bg: 'rgba(108,99,255,0.08)',
  },
  {
    key: 'nurturing',
    label: 'Nurturing',
    statuses: ['contacted', 'nurture', 'nurturing'],
    dropStatus: 'nurturing',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    key: 'meeting',
    label: 'Meeting',
    statuses: ['qualified', 'meeting_booked', 'rescheduled'],
    dropStatus: 'meeting_booked',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    key: 'proposal',
    label: 'Proposal',
    statuses: ['proposal', 'proposal_ready', 'proposal_sent'],
    dropStatus: 'proposal_sent',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
  },
  {
    key: 'closed',
    label: 'Closed Won',
    statuses: ['closed', 'converted'],
    dropStatus: 'closed',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    key: 'dead',
    label: 'Dead',
    statuses: ['canceled', 'lost'],
    dropStatus: 'lost',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
] as const;

type ColKey = (typeof COLUMNS)[number]['key'];

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

function getColKey(status: string): ColKey {
  for (const col of COLUMNS) {
    if ((col.statuses as readonly string[]).includes(status)) return col.key;
  }
  return 'new';
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  editMode,
  isDragging,
  onClick,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  editMode: boolean;
  isDragging: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const days = daysSince(lead.updated_at);
  const srcLabel = SOURCE_LABELS[lead.source] ?? lead.source;
  const srcColor = SOURCE_COLORS[lead.source] ?? '#6b7280';

  return (
    <div
      className={cn(
        styles.card,
        editMode && styles.cardEditable,
        isDragging && styles.cardDragging
      )}
      draggable={editMode}
      onDragStart={editMode ? onDragStart : undefined}
      onDragEnd={editMode ? onDragEnd : undefined}
      onClick={editMode ? undefined : onClick}
      role={editMode ? 'button' : 'button'}
      tabIndex={0}
      onKeyDown={editMode ? undefined : (e) => e.key === 'Enter' && onClick()}
    >
      {editMode && (
        <div className={styles.dragHandle} aria-hidden>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.5" />
            <circle cx="9" cy="2.5" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13.5" r="1.5" />
            <circle cx="9" cy="13.5" r="1.5" />
          </svg>
        </div>
      )}

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
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({
  col,
  leads,
  editMode,
  draggingId,
  onCardClick,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  col: (typeof COLUMNS)[number];
  leads: Lead[];
  editMode: boolean;
  draggingId: string | null;
  onCardClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: () => void;
  onDrop: (colKey: ColKey) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={cn(
        styles.column,
        editMode && styles.columnEditable,
        isOver && editMode && styles.columnDropOver
      )}
      onDragOver={
        editMode
          ? (e) => {
              e.preventDefault();
              setIsOver(true);
            }
          : undefined
      }
      onDragLeave={editMode ? () => setIsOver(false) : undefined}
      onDrop={
        editMode
          ? (e) => {
              e.preventDefault();
              setIsOver(false);
              onDrop(col.key);
            }
          : undefined
      }
    >
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

      <div className={cn(styles.columnBody, isOver && editMode && styles.columnBodyOver)}>
        {leads.length === 0 ? (
          <div className={cn(styles.columnEmpty, isOver && editMode && styles.columnEmptyOver)}>
            {isOver && editMode ? 'Drop here' : 'No leads here'}
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.lead_id}
              lead={lead}
              editMode={editMode}
              isDragging={draggingId === lead.lead_id}
              onClick={() => onCardClick(lead.lead_id)}
              onDragStart={(e) => onDragStart(e, lead.lead_id)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
        {leads.length > 0 && isOver && editMode && <div className={styles.dropPlaceholder} />}
      </div>
    </div>
  );
}

// ─── Error Toast ─────────────────────────────────────────────────────────────
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={styles.errorToast}>
      <span>⚠ {message}</span>
      <button className={styles.errorToastClose} onClick={onDismiss}>
        ✕
      </button>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────
export function PipelineBoard() {
  const router = useRouter();
  const { data, isLoading } = useLeads();
  const { mutateAsync: updateStatus } = useUpdateLeadStatus();

  const [editMode, setEditMode] = useState(false);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const serverLeads = data?.leads;

  // Sync local leads from server when not in edit mode (or on first load)
  useEffect(() => {
    if (!editMode) setLocalLeads(serverLeads ?? []);
  }, [serverLeads, editMode]);

  const dragLeadIdRef = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    dragLeadIdRef.current = leadId;
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDrop = useCallback(
    async (targetColKey: ColKey) => {
      const leadId = dragLeadIdRef.current;
      if (!leadId) return;

      const lead = localLeads.find((l) => l.lead_id === leadId);
      if (!lead) return;

      const targetCol = COLUMNS.find((c) => c.key === targetColKey)!;
      const currentColKey = getColKey(lead.status);
      if (currentColKey === targetColKey) return;

      const newStatus = targetCol.dropStatus;

      // Optimistic update
      setLocalLeads((prev) =>
        prev.map((l) => (l.lead_id === leadId ? { ...l, status: newStatus } : l))
      );

      try {
        await updateStatus({ leadId, status: newStatus });
      } catch {
        // Revert on failure
        setLocalLeads((prev) =>
          prev.map((l) => (l.lead_id === leadId ? { ...l, status: lead.status } : l))
        );
        setErrorMsg(`Failed to move ${lead.name} — changes reverted.`);
      } finally {
        dragLeadIdRef.current = null;
      }
    },
    [localLeads, updateStatus]
  );

  const grouped = COLUMNS.reduce<Record<string, Lead[]>>((acc, col) => {
    acc[col.key] = localLeads.filter((l) => (col.statuses as readonly string[]).includes(l.status));
    return acc;
  }, {});

  const toggleEditMode = () => {
    if (editMode) {
      // Exiting — sync back from server
      setLocalLeads(serverLeads ?? []);
    }
    setEditMode((v) => !v);
  };

  return (
    <div className={styles.root}>
      {errorMsg && <ErrorToast message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pipeline</h1>
          <p className={styles.subtitle}>
            {localLeads.length} total leads ·{' '}
            {editMode
              ? 'Drag cards to update their status'
              : 'Click any card to view the full lead journey'}
          </p>
        </div>
        <button
          className={cn(styles.editBtn, editMode && styles.editBtnActive)}
          onClick={toggleEditMode}
        >
          {editMode ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="2,7 6,11 12,3" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" />
              </svg>
              Edit Pipeline
            </>
          )}
        </button>
      </header>

      {editMode && (
        <div className={styles.editBanner}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="7" cy="7" r="6" />
            <line x1="7" y1="6" x2="7" y2="10" />
            <circle cx="7" cy="4" r="0.5" fill="currentColor" />
          </svg>
          Drag cards between columns to update lead status. Click <strong>Done</strong> when
          finished.
        </div>
      )}

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
              editMode={editMode}
              draggingId={draggingId}
              onCardClick={(id) => router.push(`/sales/leads/${id}`)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
