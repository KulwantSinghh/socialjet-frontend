'use client';

import Image from 'next/image';
import styles from './Topbar.module.css';
import { Input } from '@/components/ui/Input';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
      stroke="#6C63FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 17.5L13.875 13.875"
      stroke="#6C63FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotificationBell = () => (
  <div className={styles.notificationWrapper}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.02 2.91C8.71 2.91 6.02 5.6 6.02 8.91V11.8C6.02 12.41 5.76 13.34 5.45 13.86L4.3 15.77C3.59 16.94 4.08 18.26 5.39 18.7C9.69 20.14 14.34 20.14 18.65 18.7C19.86 18.3 20.39 16.87 19.73 15.77L18.58 13.86C18.28 13.34 18.02 12.41 18.02 11.8V8.91C18.02 5.61 15.32 2.91 12.02 2.91Z"
        stroke="#8E95A2"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M13.87 3.2C13.56 3.11 13.24 3.04 12.91 3C12.58 3.01 12.26 3.06 11.95 3.15"
        stroke="#8E95A2"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.02 19.06V19.17C15.02 20.82 13.67 22.17 12.02 22.17C11.2 22.17 10.45 21.84 9.9 21.3C9.35 20.76 9.02 20.01 9.02 19.19V19.06"
        stroke="#8E95A2"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className={styles.dot} />
  </div>
);

export const Topbar = () => {
  return (
    <header className={styles.root}>
      <div className={styles.content}>
        {/* Search Bar - Pillar style */}
        <div className={styles.left}>
          <Input
            placeholder="Search campaigns, influencers, or leads..."
            className={styles.searchInput}
            leftIcon={<SearchIcon />}
            id="global-search"
          />
        </div>

        {/* Right tools - Avatar + Notification */}
        <div className={styles.right}>
          <div className={styles.userSection}>
            <div className={styles.avatarWrapper}>
              <Image
                src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?fm=jpg&q=60&w=100&h=100&fit=crop"
                alt="User Avatar"
                width={34}
                height={34}
                className={styles.avatar}
                unoptimized={true} // Using external placeholder
              />
            </div>
            <button className={styles.toolBtn}>
              <NotificationBell />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
