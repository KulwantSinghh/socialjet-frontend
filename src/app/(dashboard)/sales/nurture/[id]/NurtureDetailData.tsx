'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';
import { EmailThread } from '@/components/shared/EmailThread';
import { useNurtureDetail } from '@/hooks/useNurtureDashboard';
import type { ConversationMessage } from '@/types/nurture.types';

const FORM_SOURCES = new Set([
  'webform',
  'web_form',
  'form',
  'website',
  'contact_form',
  'landing_page',
  'web',
]);

function isFormSource(source: string): boolean {
  const s = source.toLowerCase().trim();
  return FORM_SOURCES.has(s) || s.includes('form') || s.includes('web');
}

// ---- Icons ----

const MessagesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const TouchesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22C55E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ---- Helpers ----

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ---- WhatsApp conversation ----

function WhatsAppChat({
  messages,
  leadName,
}: {
  messages: ConversationMessage[];
  leadName: string;
}) {
  return (
    <div className={styles.whatsappWrapper}>
      {/* WhatsApp header bar */}
      <div className={styles.whatsappHeader}>
        <div className={styles.whatsappAvatar}>{getInitials(leadName)}</div>
        <div className={styles.whatsappContact}>
          <span className={styles.whatsappName}>{leadName}</span>
          <span className={styles.whatsappStatus}>WhatsApp</span>
        </div>
        {/* WhatsApp logo */}
        <svg
          className={styles.whatsappLogo}
          viewBox="0 0 24 24"
          fill="#25D366"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      {/* Chat body */}
      <div className={styles.whatsappBody}>
        {messages.map((msg, i) => {
          const isAssistant = msg.sender === 'assistant';
          return (
            <div key={i} className={isAssistant ? styles.waMsgRowRight : styles.waMsgRowLeft}>
              <div className={isAssistant ? styles.waBubbleOut : styles.waBubbleIn}>
                <p className={styles.waBubbleText}>{msg.text}</p>
                <span className={styles.waTime}>
                  {formatTime(msg.timestamp)}
                  {isAssistant && (
                    <svg className={styles.waReadTick} viewBox="0 0 16 11" fill="none">
                      <path
                        d="M11.071.653L4.243 7.48.929 4.167"
                        stroke="#53BDEB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.071.653L8.243 7.48"
                        stroke="#53BDEB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Default (purple) conversation ----

function DefaultChat({
  messages,
  leadName,
}: {
  messages: ConversationMessage[];
  leadName: string;
}) {
  return (
    <div className={styles.chatContainer}>
      {messages.map((msg, i) => {
        const isUser = msg.sender === 'user';
        return isUser ? (
          <div key={i} className={styles.messageRowRight}>
            <div className={styles.userBubble}>{msg.text}</div>
            <div className={styles.userAvatar}>{getInitials(leadName)}</div>
          </div>
        ) : (
          <div key={i} className={styles.messageRow}>
            <div className={styles.aiAvatar}>AI</div>
            <div className={styles.aiBubble}>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Status dot color ----

function statusDotStyle(status: string, isPaused: boolean): string {
  if (isPaused) return '#f59e0b';
  if (status === 'active') return '#22c55e';
  return '#94a3b8';
}

function statusLabel(status: string, isPaused: boolean): string {
  if (isPaused) return 'Currently Paused';
  return capitalize(status);
}

// ---- Main export ----

export function NurtureDetailData({ leadId }: { leadId: string }) {
  const { data, isLoading } = useNurtureDetail(leadId);

  const lead = data?.lead;
  const sequence = data?.sequence;
  const stats = data?.stats;
  const messages = data?.conversation_log ?? [];
  const isWhatsApp = lead?.source === 'whatsapp';
  const isForm = lead?.source ? isFormSource(lead.source) : false;

  // Skeleton breadcrumb fallback
  const displayName = isLoading ? '…' : (lead?.name ?? leadId);

  return (
    <>
      {/* Breadcrumb + Header */}
      <div className={styles.header}>
        <div className={styles.topInfo}>
          <div className={styles.breadcrumbs}>
            <Link href="/sales/nurture">Back</Link> / <span>{displayName}</span>
          </div>
          <h1 className={styles.title}>{displayName}</h1>
        </div>

        <div className={styles.mainGrid}>
          {/* Info column */}
          <div className={styles.infoCol}>
            <div className={styles.tags}>
              {lead?.tags?.map((tag) => (
                <span
                  key={tag}
                  className={
                    tag === 'Hot Lead'
                      ? styles.tagHot
                      : tag === 'whatsapp'
                        ? styles.tagWhatsapp
                        : styles.tagPricing
                  }
                >
                  {capitalize(tag)}
                </span>
              ))}
            </div>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Assigned Owner</span>
                <span className={styles.detailValue}>{lead?.assigned_to ?? '—'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Source</span>
                <span className={styles.detailValue}>
                  {lead?.source ? capitalize(lead.source) : '—'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={styles.detailValue}>
                  {lead?.status ? capitalize(lead.status) : '—'}
                </span>
              </div>
              {lead?.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{lead.phone}</span>
                </div>
              )}
              {lead?.email && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{lead.email}</span>
                </div>
              )}
              {lead?.company && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Company</span>
                  <span className={styles.detailValue}>{lead.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sequence status card */}
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Sequence Status</span>
            <div className={styles.statusContent}>
              <div className={styles.statusCurrent}>
                <span
                  className={styles.statusDot}
                  style={{
                    backgroundColor: sequence
                      ? statusDotStyle(sequence.status, sequence.is_paused)
                      : '#f59e0b',
                  }}
                />
                <span className={styles.statusText}>
                  {sequence ? statusLabel(sequence.status, sequence.is_paused) : '—'}
                  {sequence?.type ? ` · ${capitalize(sequence.type)}` : ''}
                </span>
                {sequence?.is_paused && (
                  <button className={styles.resumeBtn}>Resume Sequence</button>
                )}
              </div>
              <div className={styles.statusActions}>
                <button className={styles.convertedBtn}>Converted</button>
                <button className={styles.markDeadBtn}>
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Mark Dead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className={styles.statsRow}>
        <StatsCard
          label="Total Touches"
          value={isLoading ? '—' : String(stats?.total_touches ?? 0)}
          icon={<TouchesIcon />}
        />
        <StatsCard
          label="Messages"
          value={isLoading ? '—' : String(stats?.messages ?? 0)}
          icon={<MessagesIcon />}
        />
        <StatsCard
          label="Last Touch"
          value={isLoading || !stats?.last_touch_at ? '—' : formatTime(stats.last_touch_at)}
          icon={<ClockIcon />}
        />
      </section>

      {/* Conversation Log */}
      <section className={styles.conversationSection}>
        <div className={styles.convHeader}>
          <h2 className={styles.convTitle}>Conversation Log</h2>
        </div>

        {isForm ? (
          <EmailThread
            leadId={leadId}
            leadEmail={lead?.email ?? ''}
            leadName={lead?.name ?? 'Lead'}
          />
        ) : (
          <>
            {isLoading && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
                Loading conversation…
              </p>
            )}

            {!isLoading && messages.length === 0 && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
                No messages yet.
              </p>
            )}

            {!isLoading &&
              messages.length > 0 &&
              (isWhatsApp ? (
                <WhatsAppChat messages={messages} leadName={lead?.name ?? 'Lead'} />
              ) : (
                <DefaultChat messages={messages} leadName={lead?.name ?? 'Lead'} />
              ))}
          </>
        )}
      </section>
    </>
  );
}
