'use client';

import { useState, useMemo } from 'react';
import styles from './TranscriptPanel.module.css';
import { useTranscript } from '@/hooks/useIntelligenceCalls';

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

const SpinnerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.spinner}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

interface TranscriptPanelProps {
  meetingId?: string;
}

export const TranscriptPanel = ({ meetingId }: TranscriptPanelProps) => {
  const [search, setSearch] = useState('');
  const { data: transcript, isLoading, isError, refetch } = useTranscript(meetingId);

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
        {transcript && <span className={styles.lineCount}>{lines.length} lines</span>}
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <SpinnerIcon />
          <span>Loading transcript…</span>
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.errorState}>
          <p>Failed to load transcript.</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
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
        </>
      )}
    </section>
  );
};
