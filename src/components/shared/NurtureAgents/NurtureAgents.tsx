'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './NurtureAgents.module.css';
import type { NurtureAgent as ApiNurtureAgent } from '@/types/nurture.types';

export interface NurtureAgentsProps {
  agents?: ApiNurtureAgent[];
  isLoading?: boolean;
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ListIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export const NurtureAgents = ({ agents = [], isLoading = false }: NurtureAgentsProps) => {
  const [query, setQuery] = useState('');

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.company ?? '').toLowerCase().includes(query.toLowerCase()) ||
      a.last_message.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <span className={styles.titleIcon}>
            <ListIcon />
          </span>
          <h2 className={styles.title}>Nurture Agents</h2>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input
              id="nurture-search"
              type="text"
              placeholder="Search"
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Link href="/sales/intelligence" className={styles.newLeadBtn}>
            New Lead
          </Link>
        </div>
      </div>

      {/* Agent List */}
      <div className={styles.list}>
        {isLoading && <p className={styles.empty}>Loading…</p>}

        {!isLoading && filtered.length === 0 && (
          <p className={styles.empty}>No nurture agents found.</p>
        )}

        {!isLoading &&
          filtered.map((agent) => (
            <div key={agent.lead_id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.cardContent}>
                  <p className={styles.cardTitle}>
                    {agent.company ? `${agent.company}: ` : ''}
                    <span>{agent.name}</span>
                  </p>
                  <p className={styles.cardMessage}>{agent.last_message}</p>
                  <Link href={`/sales/nurture/${agent.lead_id}`} className={styles.reviewBtn}>
                    Review
                  </Link>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.timeBadge}>
                    <ClockIcon />
                    {relativeTime(agent.last_nurture_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
