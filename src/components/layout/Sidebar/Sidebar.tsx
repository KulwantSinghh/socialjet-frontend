'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/roles.types';
import { useAuthStore } from '@/stores/authStore';

const KNOWN_ROLES = new Set<string>(Object.values(UserRole));

function roleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) return UserRole.Admin;
  if (pathname.startsWith('/campaigns')) return UserRole.CampaignManager;
  if (pathname.startsWith('/finance')) return UserRole.Finance;
  if (pathname.startsWith('/client')) return UserRole.Client;
  if (pathname.startsWith('/sales')) return UserRole.Sales;
  return null;
}

// Sidebar Icons
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
  </svg>
);

const SalesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7.27L18.18 20H5.82L12 7.27M12 2L4.5 22H19.5L12 2Z" />
    <path d="M13 10H11V18H13V10Z" />
    <path d="M16 13H14V18H16V13Z" />
    <path d="M10 13H8V18H10V13Z" />
  </svg>
);

const CampaignIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.54 8.46C16.4771 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4771 14.6024 15.54 15.54"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Removed ToDoIcon as per sleek layout requirement

const FinanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3V21H21M7 14L11 10L15 14L21 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SystemIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="4"
      y="4"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="14"
      y="4"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="14"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="14"
      y="14"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6C4 7.65685 7.58172 9 12 9C16.4183 9 20 7.65685 20 6C20 4.34315 16.4183 3 12 3C7.58172 3 4 4.34315 4 6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 6V10C20 11.6569 16.4183 13 12 13C7.58172 13 4 11.6569 4 10V6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 10V14C20 15.6569 16.4183 17 12 17C7.58172 17 4 15.6569 4 14V10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 14V18C20 19.6569 16.4183 21 12 21C7.58172 21 4 19.6569 4 18V14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InboxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 12h-6l-2 3h-4l-2-3H2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MeetingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 2v4M8 2v4M3 10h18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 4L12 14.01l-3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PipelineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="3"
      y="3"
      width="5"
      height="18"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="10"
      y="6"
      width="5"
      height="15"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="17"
      y="9"
      width="4"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LeadsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfluencersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20v-1a6 6 0 0 1 12 0v1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 11l1.5 1.5L21 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApprovalsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 11l3 3L22 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={cn(styles.chevron, open && styles.chevronOpen)}
  >
    <path d="M10 12.5L15 7.5H5L10 12.5Z" />
  </svg>
);

// Accordion Subcomponent
const AccordionMenu = ({
  label,
  icon,
  subItems,
  pathname,
  defaultOpen,
}: {
  label: string;
  icon: React.ReactNode;
  subItems: { label: string; path: string }[];
  pathname: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <div className={styles.accordion}>
      <button className={styles.accordionTrigger} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.navLinkContent}>
          <span className={styles.iconWrapper}>{icon}</span>
          <span className={styles.linkLabel}>{label}</span>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className={styles.accordionContent}>
          <div className={styles.subItemLine} />
          <div className={styles.subItemsList}>
            {subItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  styles.subLink,
                  (pathname === item.path || pathname.startsWith(item.path + '/')) &&
                    styles.subLinkActive
                )}
              >
                <span className={styles.subLinkLabel}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  const roleFromStore = useAuthStore((s) => s.role);

  const currentRole = useMemo(() => {
    const fromStore = roleFromStore?.toLowerCase() ?? '';
    if (fromStore && KNOWN_ROLES.has(fromStore)) {
      return fromStore as UserRole;
    }
    return roleFromPathname(pathname) ?? UserRole.Sales;
  }, [roleFromStore, pathname]);

  const navConfig = useMemo(() => {
    if (currentRole === UserRole.Admin) {
      return [
        { type: 'link', label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
        { type: 'link', label: 'Approvals', path: '/admin/approvals', icon: <CheckCircleIcon /> },
        {
          type: 'accordion',
          label: 'Sales',
          icon: <SalesIcon />,
          subItems: [
            { label: 'Inbox', path: '/admin/sales/inbox' },
            { label: 'Leads', path: '/admin/sales/leads' },
            { label: 'Meetings', path: '/admin/sales/meetings' },
            { label: 'Approvals', path: '/admin/sales/meeting-requests' },
            { label: 'Lead Capture', path: '/admin/sales/lead-capture' },
            { label: 'Nurture', path: '/admin/sales/nurture' },
            { label: 'Sales Intelligence', path: '/admin/sales/intelligence' },
          ],
        },
        {
          type: 'accordion',
          label: 'Campaign Ops',
          icon: <CampaignIcon />,
          subItems: [
            { label: 'Onboarding Agent', path: '/admin/campaigns/onboarding' },
            { label: 'Discovery', path: '/admin/campaigns/discovery' },
            { label: 'Outreach', path: '/admin/campaigns/outreach' },
            { label: 'Content Tracker', path: '/admin/campaigns/content-tracker' },
            { label: 'Review', path: '/admin/campaigns/review' },
          ],
        },
        {
          type: 'accordion',
          label: 'Finance & Analytics',
          icon: <FinanceIcon />,
          subItems: [
            { label: 'Invoices', path: '/admin/finance/invoices' },
            { label: 'Reports', path: '/admin/finance/reports' },
            { label: 'Billing', path: '/admin/finance/billing' },
          ],
        },
        {
          type: 'accordion',
          label: 'System',
          icon: <SystemIcon />,
          subItems: [
            { label: 'Users', path: '/admin/system/users' },
            { label: 'Roles', path: '/admin/system/roles' },
          ],
        },
        {
          type: 'accordion',
          label: 'Influencer Database',
          icon: <DatabaseIcon />,
          subItems: [
            { label: 'Search', path: '/admin/influencers/search' },
            { label: 'Lists', path: '/admin/influencers/lists' },
          ],
        },
        {
          type: 'accordion',
          label: 'Settings',
          icon: <SettingsIcon />,
          subItems: [
            { label: 'General', path: '/admin/settings/general' },
            { label: 'Security', path: '/admin/settings/security' },
          ],
        },
      ];
    }

    if (currentRole === UserRole.CampaignManager || currentRole === UserRole.CampaignManagerLead) {
      return [
        { type: 'link', label: 'Dashboard', path: '/campaigns', icon: <DashboardIcon /> },
        { type: 'link', label: 'Leads', path: '/campaigns/leads', icon: <LeadsIcon /> },
        {
          type: 'link',
          label: 'Influencers',
          path: '/campaigns/influencers',
          icon: <InfluencersIcon />,
        },
        { type: 'link', label: 'Inbox', path: '/campaigns/inbox', icon: <InboxIcon /> },
        { type: 'link', label: 'Approvals', path: '/campaigns/approvals', icon: <ApprovalsIcon /> },
      ];
    }

    if (currentRole === UserRole.Finance) {
      return [
        { type: 'link', label: 'Dashboard', path: '/finance', icon: <DashboardIcon /> },
        {
          type: 'accordion',
          label: 'Finance',
          icon: <FinanceIcon />,
          subItems: [
            { label: 'Invoices', path: '/finance/invoices' },
            { label: 'Reports', path: '/finance/reports' },
            { label: 'Billing', path: '/finance/billing' },
          ],
        },
      ];
    }

    if (currentRole === UserRole.Client) {
      return [{ type: 'link', label: 'Dashboard', path: '/client', icon: <DashboardIcon /> }];
    }

    // Sales role: flat journey-oriented navigation
    return [
      { type: 'link', label: 'Dashboard', path: '/sales', icon: <DashboardIcon /> },
      { type: 'link', label: 'Pipeline', path: '/sales/pipeline', icon: <PipelineIcon /> },
      { type: 'link', label: 'Leads', path: '/sales/leads', icon: <LeadsIcon /> },
      { type: 'link', label: 'Inbox', path: '/sales/inbox', icon: <InboxIcon /> },
      { type: 'link', label: 'Meetings', path: '/sales/meetings', icon: <MeetingsIcon /> },
      {
        type: 'link',
        label: 'Approvals',
        path: '/sales/meeting-requests',
        icon: <CheckCircleIcon />,
      },
    ];
  }, [currentRole]);

  return (
    <aside className={styles.root}>
      {/* Brand Section */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/logoPink.svg"
            alt="SocialJet"
            className={styles.logo}
            width={151}
            height={28}
            decoding="async"
            fetchPriority="high"
          />
          <p className={styles.tagline}>Go Viral With Influencers</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav} style={{ overflowY: 'auto' }}>
        {navConfig.map((item) => {
          if (item.type === 'link') {
            // Lead detail pages (/sales/leads/[id]) highlight Pipeline
            const isLeadDetail = /^\/sales\/leads\/[^/]+/.test(pathname);
            const isCampaignLeadDetail = /^\/campaigns\/leads\/[^/]+/.test(pathname);
            const isActive = isLeadDetail
              ? item.path === '/sales/pipeline'
              : isCampaignLeadDetail
                ? item.path === '/campaigns/leads'
                : pathname === item.path ||
                  (item.path !== '/sales' &&
                    item.path !== '/campaigns' &&
                    pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path || item.label}
                href={item.path!}
                className={cn(styles.navLink, isActive && styles.navLinkActive)}
              >
                <div className={styles.navLinkContent}>
                  <span className={styles.iconWrapper}>{item.icon}</span>
                  <span className={styles.linkLabel}>{item.label}</span>
                </div>
              </Link>
            );
          }

          if (item.type === 'accordion') {
            // For older specific views, we used to have it default open. For Admin, we can have all false or specific true based on path
            const isDefaultOpen =
              item.subItems?.some(
                (sub) => pathname === sub.path || pathname.startsWith(sub.path + '/')
              ) || false;

            // Maintain exact previous behavior for Sales / Campaigns where accordion was open by default
            const forceOpen = currentRole !== UserRole.Admin ? true : isDefaultOpen;

            return (
              <AccordionMenu
                key={item.label}
                label={item.label}
                icon={item.icon}
                subItems={item.subItems || []}
                pathname={pathname}
                defaultOpen={forceOpen}
              />
            );
          }
          return null;
        })}
      </nav>

      {/* Footer Icons Section */}
      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button className={styles.actionBtn}>
            <Image src="/Volume.svg" alt="Volume" width={24} height={24} />
          </button>

          <button className={cn(styles.actionBtn, styles.actionBtnBox)}>
            <Image src="/volumeMute.svg" alt="Mute" width={20} height={20} />
          </button>

          <button className={styles.actionBtn}>
            <div className={styles.notifyWrapper}>
              <Image src="/Notification.svg" alt="Notifications" width={24} height={24} />
              <span className={styles.notifyDot} />
            </div>
          </button>

          <button className={styles.actionBtn}>
            <Image src="/darkmode.svg" alt="Dark Mode" width={20} height={20} />
          </button>

          <button className={cn(styles.actionBtn, styles.actionBtnActive)}>
            <Image src="/lightmode.svg" alt="Light Mode" width={20} height={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};
