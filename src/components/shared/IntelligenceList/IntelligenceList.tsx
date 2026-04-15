'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './IntelligenceList.module.css';
import { cn } from '@/lib/utils';
import { useIntelligenceCalls } from '@/hooks/useIntelligenceCalls';
import { useMeetings } from '@/hooks/useMeetings';
import { useCallStore } from '@/stores/callStore';
import type { IntelligenceCall } from '@/types/intelligence.types';
import type { Meeting } from '@/types/meeting.types';

// ---- Icons (unchanged) ----

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

// ---- Helpers ----

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ---- Card ----

function IntelligenceCard({
  call,
  onReview,
}: {
  call: IntelligenceCall;
  onReview: (call: IntelligenceCall) => void;
}) {
  const title = call.lead_company ? `${call.lead_company}: ${call.lead_name}` : call.lead_name;

  return (
    <div className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <h4>{title}</h4>
          <button className={styles.reviewBtn} onClick={() => onReview(call)}>
            Review
          </button>
        </div>
        <p className={cn(styles.description, call.flag_for_review && styles.flaggedDescription)}>
          {call.call_summary}
        </p>
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <CalendarIcon /> {call.duration || '—'}
          </span>
          <span className={styles.metaItem}>
            <PlatformIcon name={call.platform} /> {call.platform}
          </span>
          <span className={styles.metaItem}>
            <CalendarIcon /> {formatDate(call.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Meeting Card ----

function MeetingCard({
  meeting,
  onReview,
}: {
  meeting: Meeting;
  onReview: (meeting: Meeting) => void;
}) {
  const title = meeting.invitee_name;
  const subtitle = meeting.event_name;

  return (
    <div className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <h4>
            {title} <span>— {subtitle}</span>
          </h4>
          {meeting.has_transcript ? (
            <button className={styles.reviewBtn} onClick={() => onReview(meeting)}>
              Review
            </button>
          ) : (
            meeting.zoom_join_url && (
              <a
                className={styles.joinZoomBtn}
                href={meeting.zoom_join_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Zoom
              </a>
            )
          )}
        </div>
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <CalendarIcon /> {formatDateTime(meeting.scheduled_at)}
          </span>
          {meeting.duration && (
            <span className={styles.metaItem}>
              <CalendarIcon /> {meeting.duration}
            </span>
          )}
          <span className={styles.metaItem}>
            {meeting.meeting_status === 'done' && '✓ Done'}
            {meeting.meeting_status === 'upcoming' && '⏳ Upcoming'}
            {meeting.meeting_status === 'canceled' && '✕ Canceled'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Skeleton ----

function SkeletonCard() {
  return (
    <div className={styles.card} style={{ opacity: 0.6 }}>
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <div style={{ height: 16, width: 200, background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ height: 28, width: 60, background: '#f0f0f0', borderRadius: 8 }} />
        </div>
        <div
          style={{
            height: 14,
            width: '80%',
            background: '#f0f0f0',
            borderRadius: 4,
            margin: '8px 0 16px',
          }}
        />
        <div style={{ height: 12, width: '40%', background: '#f0f0f0', borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ---- Main ----

export const IntelligenceList = () => {
  const router = useRouter();
  const setSelectedCall = useCallStore((s) => s.setSelectedCall);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading } = useIntelligenceCalls({ days: 7, page, page_size: 30 });
  const calls = data?.calls ?? [];
  const totalPages = data?.total_pages ?? 1;

  const { data: meetingsData, isLoading: meetingsLoading } = useMeetings({
    page: 1,
    page_size: 30,
  });
  const meetings = meetingsData?.meetings ?? [];

  function handleReview(call: IntelligenceCall) {
    setSelectedCall(call);
    router.push(`/sales/intelligence/review/${call.call_id}`);
  }

  function handleMeetingReview(meeting: Meeting) {
    setSelectedCall({
      call_id: meeting.meeting_id,
      lead_id: meeting.lead_id ?? '',
      meeting_id: meeting.meeting_id,
      lead_name: meeting.invitee_name,
      lead_company: meeting.event_name,
      call_summary: meeting.transcript_content ?? '',
      client_needs: '',
      platform: 'Zoom',
      duration: meeting.duration ?? '',
      created_at: meeting.scheduled_at,
      flag_for_review: false,
      flag_reason: '',
      review_status: 'pending',
      status: 'processed',
      call_outcome: 'neutral',
      has_proposal: false,
      analyzed_by: '',
    });
    router.push(`/sales/intelligence/review/${meeting.meeting_id}`);
  }

  // Local search filter
  const searched = calls.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.lead_name.toLowerCase().includes(q) ||
      c.lead_company.toLowerCase().includes(q) ||
      c.call_summary.toLowerCase().includes(q)
    );
  });

  // Split into flagged vs processed
  const flagged = searched.filter((c) => {
    if (activeFilter === 'Pending') return false;
    return c.flag_for_review;
  });

  const processed = searched.filter((c) => {
    if (activeFilter === 'Flagged') return false;
    return !c.flag_for_review;
  });

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

      {/* Flagged Section */}
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
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : flagged.length === 0 ? (
              <p
                style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '8px 0' }}
              >
                No flagged calls.
              </p>
            ) : (
              flagged.map((call) => (
                <IntelligenceCard key={call.call_id} call={call} onReview={handleReview} />
              ))
            )}
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
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : processed.length === 0 ? (
              <p
                style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '8px 0' }}
              >
                No processed calls.
              </p>
            ) : (
              processed.map((call) => (
                <IntelligenceCard key={call.call_id} call={call} onReview={handleReview} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Meetings Section */}
      <section className={styles.group}>
        <div className={styles.groupHeader}>
          <div className={styles.groupTitle}>
            <span className={styles.calendarIconSmall}>
              <CalendarIcon />
            </span>
            <h3>Meetings</h3>
          </div>
        </div>
        <div className={styles.groupList}>
          {meetingsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : meetings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '8px 0' }}>
              No meetings found.
            </p>
          ) : (
            meetings.map((meeting) => (
              <MeetingCard
                key={meeting.meeting_id}
                meeting={meeting}
                onReview={handleMeetingReview}
              />
            ))
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronIcon direction="left" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={cn(styles.pageItem, page === p && styles.pageItemActive)}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageArrow}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
};
