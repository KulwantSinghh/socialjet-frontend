'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './NurtureAgents.module.css';

export interface NurtureAgent {
  id: string;
  brand: string;
  contact: string;
  message: string;
  timeAgo: string;
}

const NURTURE_AGENTS_DATA: NurtureAgent[] = [
  {
    id: '1',
    brand: 'Nykaa Beauty',
    contact: 'Priya Sharma',
    message: 'Hi Priya, following up on your inquiry about our influencer campaign packages...',
    timeAgo: '2 hrs ago',
  },
  {
    id: '2',
    brand: 'Mamaearth',
    contact: 'Ghazal Alagh',
    message: 'Sounds promising! Let me check with the team and get back to you.',
    timeAgo: '2 hrs ago',
  },
  {
    id: '3',
    brand: 'Mamaearth',
    contact: 'Ghazal Alagh',
    message: 'Sounds promising! Let me check with the team and get back to you.',
    timeAgo: '2 hrs ago',
  },
  {
    id: '4',
    brand: 'Nykaa Beauty',
    contact: 'Priya Sharma',
    message: 'Hi Priya, following up on your inquiry about our influencer campaign packages...',
    timeAgo: '5 hrs ago',
  },
  {
    id: '5',
    brand: 'Wow Skin Science',
    contact: 'Karan Bajaj',
    message: 'We are interested in a long-term partnership. Can you share the pricing deck?',
    timeAgo: '1 day ago',
  },
];

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

export const NurtureAgents = () => {
  const [query, setQuery] = useState('');

  const filtered = NURTURE_AGENTS_DATA.filter(
    (a) =>
      a.brand.toLowerCase().includes(query.toLowerCase()) ||
      a.contact.toLowerCase().includes(query.toLowerCase()) ||
      a.message.toLowerCase().includes(query.toLowerCase())
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
        {filtered.length === 0 ? (
          <p className={styles.empty}>No nurture agents found.</p>
        ) : (
          filtered.map((agent) => (
            <div key={agent.id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.cardContent}>
                  <p className={styles.cardTitle}>
                    {agent.brand}: <span>{agent.contact}</span>
                  </p>
                  <p className={styles.cardMessage}>{agent.message}</p>
                  <Link href={`/sales/nurture/${agent.id}`} className={styles.reviewBtn}>
                    Review
                  </Link>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.timeBadge}>
                    <ClockIcon />
                    {agent.timeAgo}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
