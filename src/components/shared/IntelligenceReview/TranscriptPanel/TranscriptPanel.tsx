'use client';

import { useState } from 'react';
import styles from './TranscriptPanel.module.css';
import { cn } from '@/lib/utils';

// Icons
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

const HighlightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

export const TranscriptPanel = () => {
  const [filter, setFilter] = useState<'Full' | 'Highlights'>('Full');
  const [search, setSearch] = useState('');

  return (
    <section className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>Transcript</h3>
        <div className={styles.segmentedControl}>
          {(['Full', 'Highlights'] as const).map((f) => (
            <button
              key={f}
              className={cn(styles.segmentBtn, filter === f && styles.segmentBtnActive)}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

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

      <div className={styles.transcriptList}>
        <div className={styles.transcriptItem}>
          <div className={styles.transcriptMeta}>
            <span className={styles.speakerName}>Sarah (Client)</span>
            <span className={styles.timestamp}>02:14</span>
          </div>
          <p className={styles.speakerText}>
            We&apos;re looking for something that can scale across our three regional offices.
            Currently, we&apos;re spending about $5k a month on manual data entry which is just too
            high.
          </p>
        </div>

        <div className={styles.transcriptItem}>
          <div className={styles.transcriptMeta}>
            <span className={styles.speakerNameSales}>Joel (Sales)</span>
            <span className={styles.timestamp}>02:45</span>
          </div>
          <p className={styles.speakerText}>
            That makes sense. Our enterprise tier is designed exactly for that multi-region setup.
            Have you set a specific budget for the transition this quarter?
          </p>
        </div>

        <div className={styles.aiHighlight}>
          <div className={styles.highlightHeader}>
            <HighlightIcon />
            <span>AI Highlight: Budget</span>
          </div>
          <p>
            &ldquo;We&apos;re looking at a $45k cap for the initial implementation phase.&rdquo;
          </p>
        </div>

        <div className={styles.transcriptItem}>
          <div className={styles.transcriptMeta}>
            <span className={styles.speakerName}>Sarah (Client)</span>
            <span className={styles.timestamp}>04:12</span>
          </div>
          <p className={styles.speakerText}>
            Ideally, we need this live by June 1st to align with our new fiscal year. Is that a
            realistic timeline for your team?
          </p>
        </div>
      </div>
    </section>
  );
};
