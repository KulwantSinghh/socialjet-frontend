'use client';

import { useState, useMemo } from 'react';
import styles from './TranscriptPanel.module.css';

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

interface TranscriptPanelProps {
  transcript?: string;
}

export const TranscriptPanel = ({ transcript }: TranscriptPanelProps) => {
  const [search, setSearch] = useState('');

  const lines = useMemo(() => {
    if (!transcript) return [];
    return transcript.split('\n').filter((l) => l.trim().length > 0);
  }, [transcript]);

  const filtered = useMemo(() => {
    if (!search.trim()) return lines;
    const q = search.toLowerCase();
    return lines.filter((l) => l.toLowerCase().includes(q));
  }, [lines, search]);

  return (
    <section className={styles.root}>
      <div className={styles.sectionHeader}>
        <h3>Transcript</h3>
      </div>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search transcript…"
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.transcriptList}>
        {!transcript ? (
          <p className={styles.empty}>No transcript available for this call.</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No results for &ldquo;{search}&rdquo;</p>
        ) : (
          filtered.map((line, i) => (
            <p key={i} className={styles.transcriptLine}>
              {line}
            </p>
          ))
        )}
      </div>
    </section>
  );
};
