'use client';

import { useState, useEffect } from 'react';
import styles from './LeadsTable.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NewLeadModal } from '@/components/shared/NewLeadModal';
import { useLeads } from '@/hooks/useLeads';
import type { Lead } from '@/types/leads.types';

// ---- helpers ----

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'Whatsapp',
  contact_form: 'Web Form',
  calendly: 'Calendly',
  manual: 'Manual',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#6C63FF',
  proposal: '#F7A83B',
  contacted: '#33E2A0',
  onboarding: '#00BA88',
  canceled: '#FF7180',
  qualified: '#33E2A0',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDealValue(val?: string | number): string {
  if (val === undefined || val === null || val === '' || Number(val) === 0) return '—';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- skeleton ----

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className={styles.skeletonRow}>
          <td>
            <div className={styles.skeletonCell} style={{ width: '140px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '80px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '90px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '70px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '100px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '90px' }} />
          </td>
        </tr>
      ))}
    </>
  );
}

// ---- row ----

function LeadRow({ lead }: { lead: Lead }) {
  const statusColor = STATUS_COLORS[lead.status] ?? '#8E95A2';
  const sourceLabel = SOURCE_LABELS[lead.source] ?? capitalize(lead.source);

  return (
    <tr>
      <td>
        <div className={styles.leadCell}>
          <div className={styles.leadLogo}>🏘️</div>
          <div className={styles.leadInfo}>
            <span className={styles.leadName}>{lead.name || '—'}</span>
            <span className={styles.leadCompany}>{lead.company || lead.email || '—'}</span>
          </div>
        </div>
      </td>
      <td>{sourceLabel}</td>
      <td>
        <span
          className={styles.statusBadge}
          style={{ color: statusColor, backgroundColor: `${statusColor}15` }}
        >
          {capitalize(lead.status)}
        </span>
      </td>
      <td>{formatDealValue(lead.deal_value)}</td>
      <td>{lead.contact_person || lead.phone || '—'}</td>
      <td>{formatDate(lead.created_at)}</td>
    </tr>
  );
}

// ---- main component ----

export const LeadsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // 400ms debounce on search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(sourceFilter ? { source: sourceFilter } : {}),
  };

  const { data, isLoading } = useLeads(Object.keys(params).length ? params : undefined);

  const leads = data?.leads ?? [];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>📋</span>
          <h3 className={styles.title}>All Leads</h3>
        </div>
        <div className={styles.actions}>
          <Input
            placeholder="Search"
            className={styles.search}
            leftIcon={<span>🔍</span>}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="proposal">Proposal</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="onboarding">Onboarding</option>
            <option value="canceled">Canceled</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
          >
            <option value="">All Sources</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="contact_form">Web Form</option>
            <option value="calendly">Calendly</option>
            <option value="manual">Manual</option>
          </select>
          <Button className={styles.newLeadBtn} onClick={() => setIsModalOpen(true)}>
            New Lead
          </Button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead name</th>
              <th>Source</th>
              <th>Status</th>
              <th>Deal value</th>
              <th>Contact</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows />}

            {!isLoading && leads.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {debouncedSearch || statusFilter || sourceFilter
                    ? 'No leads match your filters'
                    : 'No leads yet'}
                </td>
              </tr>
            )}

            {!isLoading && leads.map((lead) => <LeadRow key={lead.lead_id} lead={lead} />)}
          </tbody>
        </table>
      </div>

      <NewLeadModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
