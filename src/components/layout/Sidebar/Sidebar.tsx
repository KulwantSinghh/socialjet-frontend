'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/roles.types';

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

export const Sidebar = () => {
  const pathname = usePathname();
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  // Determine role based on route
  const currentRole = useMemo(() => {
    if (pathname.startsWith('/campaigns')) return UserRole.CampaignManager;
    return UserRole.Sales; // Default to Sales for now
  }, [pathname]);

  const navConfig = useMemo(() => {
    if (currentRole === UserRole.CampaignManager) {
      return {
        dashboardPath: '/campaigns',
        accordionLabel: 'Campaign Ops',
        accordionIcon: <CampaignIcon />,
        subItems: [
          { label: 'Onboarding Agent', path: '/campaigns/onboarding' },
          { label: 'Discovery', path: '/campaigns/discovery' },
          { label: 'Outreach', path: '/campaigns/outreach' },
          { label: 'Content Tracker', path: '/campaigns/content-tracker' },
          { label: 'Review', path: '/campaigns/review' },
        ],
      };
    }

    return {
      dashboardPath: '/sales',
      accordionLabel: 'Sales',
      accordionIcon: <SalesIcon />,
      subItems: [
        { label: 'Lead Capture', path: '/sales/lead-capture' },
        { label: 'Nurture', path: '/sales/nurture' },
        { label: 'Sales Intelligence', path: '/sales/intelligence' },
      ],
    };
  }, [currentRole]);

  return (
    <aside className={styles.root}>
      {/* Brand Section */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/logoPink.svg"
            alt="SocialJet"
            width={151}
            height={28}
            className={styles.logo}
            priority
          />
          <p className={styles.tagline}>Go Viral With Influencers</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Dashboard Link */}
        <Link
          href={navConfig.dashboardPath}
          className={cn(
            styles.navLink,
            pathname === navConfig.dashboardPath && styles.navLinkActive
          )}
        >
          <div className={styles.navLinkContent}>
            <span className={styles.iconWrapper}>
              <DashboardIcon />
            </span>
            <span className={styles.linkLabel}>Dashboard</span>
          </div>
        </Link>

        {/* Accordion Menu */}
        <div className={styles.accordion}>
          <button
            className={styles.accordionTrigger}
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <div className={styles.navLinkContent}>
              <span className={styles.iconWrapper}>{navConfig.accordionIcon}</span>
              <span className={styles.linkLabel}>{navConfig.accordionLabel}</span>
            </div>
            <ChevronIcon open={isAccordionOpen} />
          </button>

          {isAccordionOpen && (
            <div className={styles.accordionContent}>
              <div className={styles.subItemLine} />
              <div className={styles.subItemsList}>
                {navConfig.subItems.map((item) => (
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
