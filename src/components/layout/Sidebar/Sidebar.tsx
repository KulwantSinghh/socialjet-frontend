'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Sidebar.module.css';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/roles.types';

// Sidebar Icons (SVG components for dynamic parts)
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
  const [salesOpen, setSalesOpen] = useState(true);

  // In this task, we are only focusing on the Sales Sidebar per user request
  const _currentRole = UserRole.Sales;

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
          href="/sales"
          className={cn(styles.navLink, pathname === '/sales' && styles.navLinkActive)}
        >
          <div className={styles.navLinkContent}>
            <span className={styles.iconWrapper}>
              <DashboardIcon />
            </span>
            <span className={styles.linkLabel}>Dashboard</span>
          </div>
        </Link>

        {/* Sales Accordion */}
        <div className={styles.accordion}>
          <button className={styles.accordionTrigger} onClick={() => setSalesOpen(!salesOpen)}>
            <div className={styles.navLinkContent}>
              <span className={styles.iconWrapper}>
                <SalesIcon />
              </span>
              <span className={styles.linkLabel}>Sales</span>
            </div>
            <ChevronIcon open={salesOpen} />
          </button>

          {salesOpen && (
            <div className={styles.accordionContent}>
              <div className={styles.subItemLine} />
              <div className={styles.subItemsList}>
                <Link
                  href="/sales/lead-capture"
                  className={cn(
                    styles.subLink,
                    pathname === '/sales/lead-capture' && styles.subLinkActive
                  )}
                >
                  <span className={styles.subLinkLabel}>Lead Capture</span>
                </Link>
                <Link
                  href="/sales/nurture"
                  className={cn(
                    styles.subLink,
                    (pathname === '/sales/nurture' || pathname.startsWith('/sales/nurture/')) &&
                      styles.subLinkActive
                  )}
                >
                  <span className={styles.subLinkLabel}>Nurture</span>
                </Link>
                <Link
                  href="/sales/intelligence"
                  className={cn(
                    styles.subLink,
                    (pathname === '/sales/intelligence' ||
                      pathname.startsWith('/sales/intelligence/')) &&
                      styles.subLinkActive
                  )}
                >
                  <span className={styles.subLinkLabel}>Sales Intelligence</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Footer Icons Section - Using provided SVG files from /public */}
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
