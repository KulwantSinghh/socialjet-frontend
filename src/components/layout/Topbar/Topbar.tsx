'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import styles from './Topbar.module.css';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { useAlertsStore } from '@/stores/alertsStore';
import { useLeadAlerts } from '@/hooks/useLeadAlerts';
import type { LeadAlert } from '@/types/leads.types';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { usePendingMeetingRequestsCount } from '@/hooks/useMeetingRequests';

// ---- Icons ----
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path
      d="M9.167 15.833a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333ZM17.5 17.5l-3.625-3.625"
      stroke="#6C63FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12.02 2.91c-3.31 0-6 2.69-6 6v2.89c0 .61-.26 1.54-.57 2.06L4.3 15.77c-.71 1.17-.22 2.49 1.09 2.93 4.3 1.44 8.95 1.44 13.26 0 1.21-.4 1.74-1.83 1.08-2.93l-1.15-1.91c-.3-.52-.56-1.45-.56-2.06V8.91c0-3.3-2.7-6-6-6Z"
      stroke="#8E95A2"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M13.87 3.2c-.31-.09-.63-.16-.96-.2-.33.01-.65.06-.96.15M15.02 19.06v.11a3 3 0 0 1-3 3c-.82 0-1.57-.33-2.12-.87a3 3 0 0 1-.88-2.13v-.11"
      stroke="#8E95A2"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className={cn(styles.chevron, open && styles.chevronOpen)}
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="#8E95A2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AVATAR_URL =
  'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?fm=jpg&q=60&w=100&h=100&fit=crop';

// ---- Logout Confirmation Modal ----
const LogoutModal = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => {
  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.logoutModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <button className={styles.modalClose} onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.logoutIconBg}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17l5-5-5-5M21 12H9"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="logout-title" className={styles.logoutTitle}>
          Confirm Logout
        </h2>
        <p className={styles.logoutBody}>
          Are you sure you want to log out of your account?
          <br />
          You will need to enter your credentials again to access your dashboard.
        </p>

        <div className={styles.securityTip}>
          <div className={styles.securityIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5Z"
                fill="#f59e0b"
                fillOpacity="0.2"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className={styles.securityTipTitle}>Security Tip</p>
            <p className={styles.securityTipBody}>
              Logging out helps keep your data safe on shared devices.
            </p>
          </div>
        </div>

        <div className={styles.logoutActions}>
          <button className={styles.logoutCancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.logoutConfirmBtn} onClick={onConfirm} id="confirm-logout-btn">
            Log Out
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ---- Under Development Toast ----
const UnderDevelopmentToast = ({ onClose }: { onClose: () => void }) =>
  createPortal(
    <div className={styles.underDevToast}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="#6C63FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Under Development</span>
      <button className={styles.underDevClose} onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>,
    document.body
  );

// ---- Profile Dropdown ----
const ProfileDropdown = ({
  role,
  fullName,
  email,
  onSignOutClick,
}: {
  role: string;
  fullName: string;
  email: string;
  onSignOutClick: () => void;
}) => {
  const [showUnderDev, setShowUnderDev] = useState(false);
  const displayRole = role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleUnderDev = () => {
    setShowUnderDev(true);
    setTimeout(() => setShowUnderDev(false), 2500);
  };

  return (
    <>
      {showUnderDev && <UnderDevelopmentToast onClose={() => setShowUnderDev(false)} />}
      <div className={styles.dropdown}>
        {/* User header row */}
        <div className={styles.dropdownHeader}>
          <Image
            src={AVATAR_URL}
            alt={fullName}
            width={40}
            height={40}
            className={styles.dropdownAvatar}
            unoptimized
          />
          <div className={styles.dropdownUserInfo}>
            <span className={styles.dropdownName}>{fullName}</span>
            <span className={styles.dropdownEmail}>{email}</span>
          </div>
          <span className={styles.dropdownRoleBadge}>{displayRole}</span>
        </div>

        <div className={styles.dropdownDivider} />

        <nav className={styles.dropdownMenu}>
          <button className={styles.dropdownItem} onClick={handleUnderDev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M19 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0M17 10a4 4 0 0 1 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Profile Settings
          </button>
          <button className={styles.dropdownItem} onClick={handleUnderDev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 16v-4M12 8h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Help Center
          </button>
          <button className={styles.dropdownItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dark Mode
          </button>
        </nav>

        <div className={styles.dropdownDivider} />

        <button
          className={cn(styles.dropdownItem, styles.dropdownSignOut)}
          onClick={onSignOutClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );
};

// ---- Notifications Dropdown ----
const NotificationsDropdown = ({ alerts }: { alerts: LeadAlert[] }) => {
  const markAllSeen = useAlertsStore((s) => s.markAllSeen);
  const seenAlertIds = useAlertsStore((s) => s.seenAlertIds);

  useEffect(() => {
    // Optimization: we could wait a bit, but for now we mark all as seen when dropdown opens
    markAllSeen();
  }, [markAllSeen]);

  return (
    <div className={styles.notifDropdown}>
      <div className={styles.notifHeader}>
        <h3 className={styles.notifTitle}>Notifications</h3>
        {alerts.length > 0 && <span className={styles.notifBadge}>{alerts.length} New</span>}
      </div>

      <div className={styles.notifList}>
        {alerts.length === 0 ? (
          <div className={styles.emptyNotif}>
            <BellIcon />
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <button
              key={alert.lead_id}
              className={cn(
                styles.notifItem,
                !seenAlertIds.has(alert.lead_id) && styles.notifItemUnread
              )}
            >
              <div className={styles.notifItemIcon}>
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className={styles.notifItemContent}>
                <p className={styles.notifItemName}>{alert.name}</p>
                <p className={styles.notifItemPreview}>
                  {truncate(alert.message || alert.notes || '', 50)}
                </p>
                <span className={styles.notifItemTime}>{formatRelativeTime(alert.created_at)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className={styles.notifFooter}>
        <button className={styles.seeAllBtn}>View all notifications</button>
      </div>
    </div>
  );
};

// ---- Main Topbar ----
export const Topbar = () => {
  const router = useRouter();
  const { role, logout, user, username } = useAuthStore();
  const fullName =
    (user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '') || username || 'User';
  const userEmail = user?.email ?? '';
  const { data: alertsData } = useLeadAlerts();
  const hasUnread = useAlertsStore((s) => s.hasUnread());
  const pendingMeetingRequests = usePendingMeetingRequestsCount();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    // Clear session and navigate immediately so logout always works even if the API is slow or returns 401.
    logout();
    router.replace('/login');
    void authService.logout().catch(() => {
      /* best-effort server invalidation */
    });
  };

  const displayRole = (role ?? 'User').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <header className={styles.root}>
        <div className={styles.content}>
          {/* Search */}
          <div className={styles.left}>
            <Input
              placeholder="Search campaigns, influencers, or leads..."
              className={styles.searchInput}
              leftIcon={<SearchIcon />}
              id="global-search"
            />
          </div>

          {/* Right section */}
          <div className={styles.right}>
            {/* Notification Bell */}
            <div className={styles.notificationSection} ref={notifRef}>
              <button
                className={styles.bellBtn}
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
                aria-expanded={notifOpen}
              >
                <div className={styles.notificationWrapper}>
                  <BellIcon />
                  {(hasUnread || (pendingMeetingRequests.data ?? 0) > 0) && (
                    <span className={styles.dot}>
                      {(pendingMeetingRequests.data ?? 0) > 0 && (
                        <span className={styles.meetingRequestCount}>
                          {pendingMeetingRequests.data}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </button>

              {notifOpen && <NotificationsDropdown alerts={alertsData?.alerts || []} />}
            </div>

            <div className={styles.separator} />

            {/* Profile trigger */}
            <div className={styles.profileSection} ref={dropdownRef}>
              <button
                className={styles.profileTrigger}
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                id="user-menu-btn"
              >
                <Image
                  src={AVATAR_URL}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className={styles.avatar}
                  unoptimized
                />
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>{fullName}</span>
                  <span className={styles.profileRole}>{displayRole}</span>
                </div>
                <ChevronIcon open={dropdownOpen} />
              </button>

              {dropdownOpen && (
                <ProfileDropdown
                  role={role ?? 'user'}
                  fullName={fullName}
                  email={userEmail}
                  onSignOutClick={() => {
                    setDropdownOpen(false);
                    setLogoutModalOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {logoutModalOpen && (
        <LogoutModal onCancel={() => setLogoutModalOpen(false)} onConfirm={handleConfirmLogout} />
      )}
    </>
  );
};
