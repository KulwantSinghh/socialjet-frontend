'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './EmailThread.module.css';
import {
  useEmailHistory,
  useGenerateDraft,
  useApproveEmail,
  useDeleteDraft,
} from '@/hooks/useNurtureDashboard';
import type { NurtureEmail } from '@/types/nurture.types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diffDays < 7)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(value?: string): string {
  if (!value) return '?';
  const local = value.includes('@') ? value.split('@')[0] : value;
  return local.slice(0, 2).toUpperCase();
}

function avatarColor(str?: string): string {
  const palette = [
    '#6c63ff',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
  ];
  if (!str) return palette[0];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

// ─────────────────────────────────────────────
// Icons — consistent 16×16 stroke icons
// ─────────────────────────────────────────────

const IconSend = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconSparkle = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const IconPaperclip = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconTrash = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconChevronDown = () => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconReply = () => (
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
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

const IconForward = () => (
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
    <polyline points="15 17 20 12 15 7" />
    <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
  </svg>
);

const IconDots = () => (
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
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

const IconEmail = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconBold = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const IconItalic = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const IconUnderline = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const IconListUl = () => (
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
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconLink = () => (
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// ─────────────────────────────────────────────
// Helpers for display
// ─────────────────────────────────────────────

function resolveActor(id?: string): string {
  if (!id) return 'Unknown';
  if (id.startsWith('system_')) return 'System (Auto)';
  // UUID — a human agent
  return 'Agent';
}

function bodySnippet(body?: string, max = 100): string {
  if (!body) return '';
  // strip leading greeting line (e.g. "Hi Testing,")
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const content = lines.length > 1 ? lines.slice(1).join(' ') : (lines[0] ?? '');
  return content.length > max ? content.slice(0, max) + '…' : content;
}

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────

function StatusPill({ status }: { status: NurtureEmail['status'] }) {
  const map: Record<NurtureEmail['status'], { label: string; cls: string }> = {
    sent: { label: 'Sent', cls: styles.pillSent },
    draft: { label: 'Draft', cls: styles.pillDraft },
    pending_approval: { label: 'Awaiting approval', cls: styles.pillPending },
    failed: { label: 'Failed', cls: styles.pillFailed },
  };
  const { label, cls } = map[status] ?? { label: status, cls: styles.pillDraft };
  return <span className={`${styles.pill} ${cls}`}>{label}</span>;
}

// ─────────────────────────────────────────────
// Direction badge
// ─────────────────────────────────────────────

const IconOutbound = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const IconInbound = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </svg>
);

function DirectionBadge({ direction }: { direction?: string }) {
  const isOut = direction !== 'inbound';
  return (
    <span className={`${styles.dirBadge} ${isOut ? styles.dirBadgeOut : styles.dirBadgeIn}`}>
      {isOut ? <IconOutbound /> : <IconInbound />}
      {isOut ? 'Outbound' : 'Inbound'}
    </span>
  );
}

// ─────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────

function Avatar({ value, size = 36, label }: { value?: string; size?: number; label?: string }) {
  const bg = avatarColor(value);
  const initials = label
    ? label
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : getInitials(value);
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, minWidth: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────
// Single email item — collapsible thread card
// ─────────────────────────────────────────────

function EmailItem({
  email,
  index,
  total,
  defaultOpen,
  onReply,
}: {
  email: NurtureEmail;
  index: number;
  total: number;
  defaultOpen: boolean;
  onReply: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [actionsOpen, setActionsOpen] = useState(false);

  const isOutbound = email.direction !== 'inbound';
  const displayBody = email.final_body ?? email.body ?? '';
  const displaySubject = email.final_subject ?? email.subject ?? '';
  const sentTime = email.sent_at ?? email.created_at;
  const isAutoSystem = email.drafted_by?.startsWith('system_');

  // Collapsed header: who sent it
  const senderLabel = isOutbound ? 'SocialJet' : (email.lead_name ?? email.lead_email ?? 'Lead');
  const senderSub = isOutbound
    ? `→ ${email.lead_name ?? ''} <${email.lead_email ?? ''}>`
    : `→ SocialJet`;

  return (
    <div className={`${styles.emailCard} ${open ? styles.emailCardOpen : ''}`}>
      {/* ── Collapsed / summary row ── */}
      <button
        type="button"
        className={styles.emailSummaryRow}
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        {/* Avatar — outbound = SJ logo color, inbound = lead color */}
        <div className={styles.emailAvatarWrap}>
          <Avatar
            value={isOutbound ? 'socialjet' : email.lead_email}
            label={isOutbound ? 'SJ' : undefined}
            size={38}
          />
          <span
            className={`${styles.emailAvatarDir} ${isOutbound ? styles.emailAvatarDirOut : styles.emailAvatarDirIn}`}
          >
            {isOutbound ? <IconOutbound /> : <IconInbound />}
          </span>
        </div>

        <div className={styles.emailSummaryBody}>
          <div className={styles.emailSummaryTop}>
            <span className={styles.emailSenderName}>{senderLabel}</span>
            <span className={styles.emailSenderSub}>{senderSub}</span>
            <div className={styles.emailSummaryPills}>
              <StatusPill status={email.status} />
              {isAutoSystem && <span className={`${styles.pill} ${styles.pillAuto}`}>Auto</span>}
            </div>
          </div>
          {!open && (
            <p className={styles.emailSummarySnippet}>
              <span className={styles.emailSummarySubject}>{displaySubject}</span>
              {' — '}
              {bodySnippet(displayBody)}
            </p>
          )}
          {open && <p className={styles.emailSummarySubjectFull}>{displaySubject}</p>}
        </div>

        <div className={styles.emailSummaryMeta}>
          <span className={styles.emailDate}>{formatDateShort(sentTime)}</span>
          {total > 1 && (
            <span className={styles.emailIndexBadge}>
              {index + 1}/{total}
            </span>
          )}
          <span className={`${styles.chevronIcon} ${open ? styles.chevronOpen : ''}`}>
            <IconChevronDown />
          </span>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div className={styles.emailExpanded}>
          {/* ── Meta strip ── */}
          <div className={styles.emailMetaStrip}>
            <DirectionBadge direction={email.direction} />
            <span className={styles.emailMetaDot} />
            <span className={styles.emailMetaItem}>
              <span className={styles.emailMetaKey}>Sent</span>
              {formatDateFull(sentTime)}
            </span>
            {email.previous_email_count !== undefined && (
              <>
                <span className={styles.emailMetaDot} />
                <span className={styles.emailMetaItem}>
                  <span className={styles.emailMetaKey}>Email</span>#
                  {email.previous_email_count + 1} in thread
                </span>
              </>
            )}
          </div>

          {/* ── Header table ── */}
          <div className={styles.emailDetailHeader}>
            <table className={styles.emailHeaderTable}>
              <tbody>
                <tr>
                  <td className={styles.emailHeaderKey}>From</td>
                  <td className={styles.emailHeaderVal}>
                    {isOutbound
                      ? 'Team SocialJet'
                      : `${email.lead_name ?? 'Lead'} <${email.lead_email ?? ''}>`}
                  </td>
                </tr>
                <tr>
                  <td className={styles.emailHeaderKey}>To</td>
                  <td className={styles.emailHeaderVal}>
                    {isOutbound
                      ? `${email.lead_name ?? 'Lead'} <${email.lead_email ?? ''}>`
                      : 'Team SocialJet'}
                  </td>
                </tr>
                {email.cc && (
                  <tr>
                    <td className={styles.emailHeaderKey}>CC</td>
                    <td className={styles.emailHeaderVal}>{email.cc}</td>
                  </tr>
                )}
                <tr>
                  <td className={styles.emailHeaderKey}>Subject</td>
                  <td className={styles.emailHeaderVal}>
                    <strong>{displaySubject}</strong>
                  </td>
                </tr>
                <tr>
                  <td className={styles.emailHeaderKey}>Date</td>
                  <td className={styles.emailHeaderVal}>{formatDateFull(sentTime)}</td>
                </tr>
                <tr>
                  <td className={styles.emailHeaderKey}>Drafted</td>
                  <td className={styles.emailHeaderVal}>
                    <span className={styles.actorBadge}>{resolveActor(email.drafted_by)}</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.emailHeaderKey}>Approved</td>
                  <td className={styles.emailHeaderVal}>
                    <span className={styles.actorBadge}>{resolveActor(email.approved_by)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Custom instructions badge ── */}
          {email.custom_instructions && (
            <div className={styles.customInstructionsBadge}>
              <IconSparkle />
              <span className={styles.customInstructionsBadgeLabel}>AI instructions:</span>
              <span className={styles.customInstructionsBadgeText}>
                {email.custom_instructions}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className={styles.emailBodyDivider} />

          {/* Email body */}
          <div
            className={styles.emailBodyContent}
            dangerouslySetInnerHTML={{ __html: displayBody.replace(/\n/g, '<br/>') }}
          />

          {/* Attachments */}
          {(email.attachments?.length ?? 0) > 0 && (
            <div className={styles.attachmentsSection}>
              <span className={styles.attachmentsLabel}>
                <IconPaperclip />
                {email.attachments!.length} attachment{email.attachments!.length > 1 ? 's' : ''}
              </span>
              <div className={styles.attachmentsRow}>
                {email.attachments!.map((att) => (
                  <a
                    key={att.url}
                    href={att.url}
                    className={styles.attachmentFile}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className={styles.attachmentFileIcon}>
                      <IconPaperclip />
                    </span>
                    <span className={styles.attachmentFileName}>{att.name}</span>
                    <span className={styles.attachmentFileSize}>
                      {att.size ? `${Math.round(att.size / 1024)} KB` : ''}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className={styles.emailActionBar}>
            <button type="button" className={styles.emailActionBtn} onClick={onReply}>
              <IconReply />
              Reply
            </button>
            <button type="button" className={styles.emailActionBtn}>
              <IconForward />
              Forward
            </button>
            <div className={styles.emailActionSpacer} />
            <div className={styles.emailMoreWrap}>
              <button
                type="button"
                className={styles.emailActionBtnIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsOpen((p) => !p);
                }}
                aria-label="More actions"
              >
                <IconDots />
              </button>
              {actionsOpen && (
                <div className={styles.emailMoreMenu}>
                  <button type="button" className={styles.emailMoreItem}>
                    Mark as unread
                  </button>
                  <button type="button" className={styles.emailMoreItem}>
                    Print
                  </button>
                  <button
                    type="button"
                    className={`${styles.emailMoreItem} ${styles.emailMoreItemDanger}`}
                    onClick={() => setActionsOpen(false)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Rich-text toolbar
// ─────────────────────────────────────────────

const FONT_FAMILIES = [
  { label: 'Inter (Default)', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
];

const FONT_SIZES = [
  { label: '12px', value: '1' },
  { label: '14px', value: '2' },
  { label: '16px', value: '3' },
  { label: '18px', value: '4' },
  { label: '20px', value: '5' },
  { label: '24px', value: '6' },
];

function ToolbarSeparator() {
  return <span className={styles.tbSep} />;
}

function ToolbarBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`${styles.tbBtn} ${active ? styles.tbBtnActive : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function RichToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const exec = useCallback(
    (cmd: string, value?: string) => {
      editorRef.current?.focus();

      document.execCommand(cmd, false, value);
      setActiveFormats({
        bold: document.queryCommandState('bold'),

        italic: document.queryCommandState('italic'),

        underline: document.queryCommandState('underline'),
      });
    },
    [editorRef]
  );

  return (
    <div className={styles.toolbar}>
      {/* Font family */}
      <select
        className={styles.tbSelect}
        defaultValue="Inter, sans-serif"
        onChange={(e) => exec('fontName', e.target.value)}
        aria-label="Font family"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font size */}
      <select
        className={`${styles.tbSelect} ${styles.tbSelectSm}`}
        defaultValue="2"
        onChange={(e) => exec('fontSize', e.target.value)}
        aria-label="Font size"
      >
        {FONT_SIZES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <ToolbarSeparator />

      <ToolbarBtn title="Bold (Ctrl+B)" active={activeFormats.bold} onClick={() => exec('bold')}>
        <IconBold />
      </ToolbarBtn>
      <ToolbarBtn
        title="Italic (Ctrl+I)"
        active={activeFormats.italic}
        onClick={() => exec('italic')}
      >
        <IconItalic />
      </ToolbarBtn>
      <ToolbarBtn
        title="Underline (Ctrl+U)"
        active={activeFormats.underline}
        onClick={() => exec('underline')}
      >
        <IconUnderline />
      </ToolbarBtn>

      <ToolbarSeparator />

      <ToolbarBtn title="Bullet list" onClick={() => exec('insertUnorderedList')}>
        <IconListUl />
      </ToolbarBtn>

      <ToolbarBtn
        title="Insert link"
        onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) exec('createLink', url);
        }}
      >
        <IconLink />
      </ToolbarBtn>

      <ToolbarSeparator />

      {/* Text colour */}
      <label className={styles.tbColorLabel} title="Text color">
        <span className={styles.tbColorIcon}>A</span>
        <input
          type="color"
          className={styles.tbColorInput}
          defaultValue="#111827"
          onInput={(e) => exec('foreColor', (e.target as HTMLInputElement).value)}
          aria-label="Text color"
        />
      </label>

      {/* Highlight */}
      <label className={styles.tbHighlightLabel} title="Highlight color">
        <span className={styles.tbHighlightIcon}>H</span>
        <input
          type="color"
          className={styles.tbColorInput}
          defaultValue="#fef08a"
          onInput={(e) => exec('hiliteColor', (e.target as HTMLInputElement).value)}
          aria-label="Highlight color"
        />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tone presets
// ─────────────────────────────────────────────

const TONE_PRESETS = [
  { label: 'Professional', value: 'Make this email professional and formal.' },
  { label: 'Friendly', value: 'Make this email warm, friendly, and conversational.' },
  {
    label: 'Follow-up',
    value: 'Write a polite follow-up email checking in on the previous conversation.',
  },
  { label: 'Short & Sharp', value: 'Keep it concise — 3 sentences max, direct and to the point.' },
  {
    label: 'Persuasive',
    value: 'Write a persuasive email that highlights value and encourages action.',
  },
];

// ─────────────────────────────────────────────
// Compose panel
// ─────────────────────────────────────────────

interface ComposeProps {
  leadId: string;
  leadEmail: string;
  draft: NurtureEmail | null;
  onClose: () => void;
}

function ComposePanel({ leadId, leadEmail, draft, onClose }: ComposeProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState(draft?.subject ?? '');
  const [cc, setCc] = useState(draft?.cc ?? '');
  const [bcc, setBcc] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [ccVisible, setCcVisible] = useState(!!draft?.cc);
  const [bccVisible, setBccVisible] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  const generateDraft = useGenerateDraft(leadId);
  const approveEmail = useApproveEmail(leadId);
  const deleteDraft = useDeleteDraft(leadId);

  useEffect(() => {
    if (draft?.body && editorRef.current) {
      editorRef.current.innerHTML = draft.body.replace(/\n/g, '<br/>');
    }
  }, [draft?.body]);

  const handleGenerate = useCallback(async () => {
    const result = await generateDraft.mutateAsync(customInstructions || undefined);
    setSubject(result.subject ?? '');
    if (editorRef.current) {
      editorRef.current.innerHTML = (result.body ?? '').replace(/\n/g, '<br/>');
    }
  }, [generateDraft, customInstructions]);

  const handleSend = useCallback(async () => {
    if (!draft) return;
    const body = editorRef.current?.innerHTML ?? '';
    try {
      await approveEmail.mutateAsync({
        emailId: draft.email_id,
        subject,
        body,
        cc: cc || undefined,
      });
      onClose();
    } catch {
      // error shown via approveEmail.isError — compose stays open
    }
  }, [draft, subject, cc, approveEmail, onClose]);

  const handleDiscard = useCallback(async () => {
    if (draft) await deleteDraft.mutateAsync(draft.email_id);
    onClose();
  }, [draft, deleteDraft, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
    e.target.value = '';
  };

  const applyTonePreset = (value: string) => {
    setCustomInstructions(value);
    setInstructionsOpen(true);
  };

  const isSending = approveEmail.isPending;
  const isGenerating = generateDraft.isPending;

  return (
    <div className={styles.compose}>
      {/* ── Compose toolbar header ── */}
      <div className={styles.composeTopBar}>
        <div className={styles.composeTopLeft}>
          <span className={styles.composeTitleTag}>
            {draft?.status === 'pending_approval'
              ? 'AI Draft — Review before sending'
              : draft
                ? 'Edit Draft'
                : 'New Message'}
          </span>
        </div>
        <div className={styles.composeTopRight}>
          <button
            type="button"
            className={`${styles.btnInstructions} ${instructionsOpen ? styles.btnInstructionsActive : ''}`}
            onClick={() => setInstructionsOpen((p) => !p)}
            title="Custom instructions for AI"
          >
            <IconSparkle />
            Instructions
            {customInstructions && <span className={styles.instructionsDot} />}
          </button>
          <button
            type="button"
            className={styles.btnAiDraft}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className={styles.btnSpinner} />
                Generating…
              </>
            ) : (
              <>
                <IconSparkle />
                Generate AI Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Custom instructions panel ── */}
      {instructionsOpen && (
        <div className={styles.instructionsPanel}>
          <div className={styles.instructionsPanelHeader}>
            <span className={styles.instructionsPanelTitle}>Custom Instructions</span>
            <span className={styles.instructionsPanelHint}>
              Tell the AI how to write this email
            </span>
          </div>
          <div className={styles.tonePresets}>
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`${styles.toneChip} ${customInstructions === preset.value ? styles.toneChipActive : ''}`}
                onClick={() => applyTonePreset(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <textarea
            className={styles.instructionsTextarea}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. Keep it under 100 words, reference our pricing page, use a friendly tone…"
            rows={3}
          />
        </div>
      )}

      {/* ── Send error ── */}
      {approveEmail.isError && (
        <div className={styles.sendError}>Failed to send email. Please try again.</div>
      )}

      {/* ── Address fields ── */}
      <div className={styles.composeFields}>
        <div className={styles.composeField}>
          <span className={styles.composeFieldLabel}>To</span>
          <span className={styles.composeFieldValue}>{leadEmail}</span>
          <div className={styles.composeFieldActions}>
            {!ccVisible && (
              <button
                type="button"
                className={styles.fieldToggleBtn}
                onClick={() => setCcVisible(true)}
              >
                CC
              </button>
            )}
            {!bccVisible && (
              <button
                type="button"
                className={styles.fieldToggleBtn}
                onClick={() => setBccVisible(true)}
              >
                BCC
              </button>
            )}
          </div>
        </div>

        {ccVisible && (
          <div className={styles.composeField}>
            <span className={styles.composeFieldLabel}>CC</span>
            <input
              className={styles.composeInput}
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="Add CC recipients"
              autoFocus
            />
            <button
              type="button"
              className={styles.fieldRemoveBtn}
              onClick={() => {
                setCcVisible(false);
                setCc('');
              }}
            >
              ×
            </button>
          </div>
        )}

        {bccVisible && (
          <div className={styles.composeField}>
            <span className={styles.composeFieldLabel}>BCC</span>
            <input
              className={styles.composeInput}
              type="email"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="Add BCC recipients"
            />
            <button
              type="button"
              className={styles.fieldRemoveBtn}
              onClick={() => {
                setBccVisible(false);
                setBcc('');
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.composeField}>
          <span className={styles.composeFieldLabel}>Subject</span>
          <input
            className={styles.composeInput}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>
      </div>

      {/* ── Rich text toolbar ── */}
      <RichToolbar editorRef={editorRef} />

      {/* ── Body editor ── */}
      <div
        ref={editorRef}
        className={styles.composeBody}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing, or click 'Generate AI Draft' to let AI craft the perfect email…"
        spellCheck
      />

      {/* ── Attached files ── */}
      {attachments.length > 0 && (
        <div className={styles.composeAttachments}>
          {attachments.map((f, i) => (
            <div key={i} className={styles.composeAttachFile}>
              <IconPaperclip />
              <span className={styles.composeAttachName}>{f.name}</span>
              <span className={styles.composeAttachSize}>{Math.round(f.size / 1024)} KB</span>
              <button
                type="button"
                className={styles.composeAttachRemove}
                onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer action bar ── */}
      <div className={styles.composeFooter}>
        <div className={styles.composeFooterLeft}>
          <button
            type="button"
            className={styles.btnSend}
            onClick={handleSend}
            disabled={isSending || !draft}
          >
            {isSending ? (
              <>
                <span className={styles.btnSpinner} />
                Sending…
              </>
            ) : (
              <>
                <IconSend />
                Approve &amp; Send
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.btnAttach}
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPaperclip />
            Attach
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </div>

        <button
          type="button"
          className={styles.btnDiscard}
          onClick={handleDiscard}
          disabled={deleteDraft.isPending}
        >
          <IconTrash />
          Discard
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main EmailThread
// ─────────────────────────────────────────────

interface EmailThreadProps {
  leadId: string;
  leadEmail: string;
  leadName: string;
}

export function EmailThread({ leadId, leadEmail, leadName }: EmailThreadProps) {
  const { data, isLoading } = useEmailHistory(leadId);
  const generateDraft = useGenerateDraft(leadId);
  const [composing, setComposing] = useState(false);

  const emails = data?.emails ?? [];
  const sentEmails = emails.filter((e) => e.status === 'sent');
  const pendingDraft =
    emails.find((e) => e.status === 'draft' || e.status === 'pending_approval') ?? null;
  const sentCount = data?.sent_count ?? sentEmails.length;

  // Auto-open compose when a pending draft exists server-side
  useEffect(() => {
    if (pendingDraft) setComposing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDraft?.email_id]);

  const handleNewDraft = useCallback(async () => {
    await generateDraft.mutateAsync(undefined);
    setComposing(true);
  }, [generateDraft]);

  return (
    <div className={styles.root}>
      {/* ── Thread header ── */}
      <div className={styles.threadHeader}>
        <div className={styles.threadHeaderLeft}>
          <Avatar value={leadEmail} label={leadName} size={40} />
          <div className={styles.threadHeaderInfo}>
            <span className={styles.threadContactName}>{leadName}</span>
            <span className={styles.threadContactEmail}>{leadEmail}</span>
          </div>
          {sentCount > 0 && (
            <span className={styles.threadCount}>
              {sentCount} email{sentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className={styles.threadHeaderRight}>
          {!composing && (
            <>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={() => setComposing(true)}
              >
                Compose
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleNewDraft}
                disabled={generateDraft.isPending}
              >
                {generateDraft.isPending ? (
                  <>
                    <span className={styles.btnSpinner} />
                    Generating…
                  </>
                ) : (
                  <>
                    <IconSparkle />
                    AI Draft
                  </>
                )}
              </button>
            </>
          )}
          {composing && (
            <button type="button" className={styles.btnGhost} onClick={() => setComposing(false)}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Thread body ── */}
      <div className={styles.threadBody}>
        {/* Loading skeleton */}
        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.loadingPulse}>
              <div className={styles.loadingBar} style={{ width: '60%' }} />
              <div className={styles.loadingBar} style={{ width: '80%' }} />
              <div className={styles.loadingBar} style={{ width: '40%' }} />
            </div>
            <p className={styles.stateSubtext}>Loading email history…</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sentEmails.length === 0 && !composing && (
          <div className={styles.stateBox}>
            <div className={styles.emptyIllustration}>
              <IconEmail />
            </div>
            <p className={styles.stateTitle}>No emails yet</p>
            <p className={styles.stateSubtext}>
              Generate an AI-crafted draft and send your first email to this lead.
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleNewDraft}
              disabled={generateDraft.isPending}
            >
              {generateDraft.isPending ? (
                <>
                  <span className={styles.btnSpinner} />
                  Generating…
                </>
              ) : (
                <>
                  <IconSparkle />
                  Generate AI Draft
                </>
              )}
            </button>
          </div>
        )}

        {/* Email thread list — all sent, oldest collapsed, newest open */}
        {!isLoading && sentEmails.length > 0 && (
          <div className={styles.emailList}>
            {sentEmails.map((email, i) => (
              <EmailItem
                key={email.email_id}
                email={email}
                index={i}
                total={sentEmails.length}
                defaultOpen={i === sentEmails.length - 1 && !composing}
                onReply={() => setComposing(true)}
              />
            ))}
          </div>
        )}

        {/* Compose / draft panel */}
        {composing && (
          <ComposePanel
            leadId={leadId}
            leadEmail={leadEmail}
            draft={pendingDraft}
            onClose={() => setComposing(false)}
          />
        )}
      </div>
    </div>
  );
}
