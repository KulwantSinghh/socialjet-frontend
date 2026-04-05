'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './IntelligenceList.module.css';
import { cn } from '@/lib/utils';

// Icons
const ChevronIcon = ({
  direction = 'down',
  size = 16,
}: {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform:
        direction === 'left' ? 'rotate(90deg)' : direction === 'right' ? 'rotate(-90deg)' : 'none',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlatformIcon = ({ name }: { name: string }) => {
  if (name.toLowerCase().includes('zoom')) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 6L22 18L17 14L17 10L22 6Z" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </svg>
    );
  }
  return null;
};

// Data
const FLAGGED_CALLS = [
  {
    id: 'f1',
    brand: 'Freshworks India',
    contact: 'Rajan Pillai',
    description:
      'Cancellation intent — client mentioned exploring another agency. No proposal generated.',
    time: '18 min',
    platform: 'Zoom',
    date: 'March 19, 2025',
    isFlagged: true,
  },
];

const PROCESSED_CALLS = [
  {
    id: 'p1',
    brand: 'WOW Skin Science',
    contact: 'Manish Chowdhary',
    description:
      "Instagram Reels + YouTube with skincare creators. 'Dermatologist-tested' messaging required.",
    time: '18 min',
    platform: 'Zoom',
    date: 'March 19, 2025',
  },
  {
    id: 'p2',
    brand: 'Boat Lifestyle',
    contact: 'Aman Gupta',
    description:
      "Instagram Reels + YouTube with skincare creators. 'Dermatologist-tested' messaging required.",
    time: '18 min',
    platform: 'Zoom',
    date: 'March 19, 2025',
  },
  {
    id: 'p3',
    brand: 'Sugar Cosmetics',
    contact: 'Vineeta Singh',
    description:
      "Instagram Reels + YouTube with skincare creators. 'Dermatologist-tested' messaging required.",
    time: '18 min',
    platform: 'Zoom',
    date: 'March 19, 2025',
  },
];

export const IntelligenceList = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.segmentedControl}>
          {['All', 'Pending', 'Flagged'].map((f) => (
            <button
              key={f}
              className={cn(styles.segmentBtn, activeFilter === f && styles.segmentBtnActive)}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <button className={styles.datePicker}>
          <CalendarIcon />
          <span>Last 7 Days</span>
        </button>
      </div>

      {/* Flags Section */}
      {(activeFilter === 'All' || activeFilter === 'Flagged') && (
        <section className={styles.group}>
          <div className={styles.groupHeader}>
            <div className={styles.groupTitle}>
              <span className={styles.flagIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </span>
              <h3>Flagged Calls — No Proposal Generated</h3>
            </div>
            <button className={styles.filterBtn}>
              <FilterIcon /> <span>Filter</span>
            </button>
          </div>
          <div className={styles.groupList}>
            {FLAGGED_CALLS.map((call) => (
              <IntelligenceCard key={call.id} call={call} />
            ))}
          </div>
        </section>
      )}

      {/* Processed Section */}
      {(activeFilter === 'All' || activeFilter === 'Pending') && (
        <section className={styles.group}>
          <div className={styles.groupHeader}>
            <div className={styles.groupTitle}>
              <span className={styles.phoneIconSmall}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 015.01 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l2.21-2.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
              <h3>Processed Calls — Proposals Generated</h3>
            </div>
            <button className={styles.filterBtn}>
              <FilterIcon /> <span>Filter</span>
            </button>
          </div>
          <div className={styles.groupList}>
            {PROCESSED_CALLS.map((call) => (
              <IntelligenceCard key={call.id} call={call} />
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      <div className={styles.pagination}>
        <button className={styles.pageArrow}>
          <ChevronIcon direction="left" />
        </button>
        <button className={cn(styles.pageItem, styles.pageItemActive)}>1</button>
        <button className={styles.pageItem}>2</button>
        <button className={styles.pageItem}>3</button>
        <button className={styles.pageArrow}>
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
};

interface IntelligenceCall {
  id: string;
  brand: string;
  contact: string;
  description: string;
  time: string;
  platform: string;
  date: string;
  isFlagged?: boolean;
}

const IntelligenceCard = ({ call }: { call: IntelligenceCall }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <h4>
            {call.brand}: <span>{call.contact}</span>
          </h4>
          <Link href={`/sales/intelligence/review/${call.id}`} className={styles.reviewBtn}>
            Review
          </Link>
        </div>
        <p className={cn(styles.description, call.isFlagged && styles.flaggedDescription)}>
          {call.description}
        </p>
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <CalendarIcon /> {call.time}
          </span>
          <span className={styles.metaItem}>
            <PlatformIcon name={call.platform} /> {call.platform}
          </span>
          <span className={styles.metaItem}>
            <CalendarIcon /> {call.date}
          </span>
        </div>
      </div>
    </div>
  );
};
