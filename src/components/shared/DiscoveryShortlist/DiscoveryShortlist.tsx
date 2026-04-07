'use client';

import Image from 'next/image';
import styles from './DiscoveryShortlist.module.css';
import { Button } from '@/components/ui/Button';

const SHORTLIST = [
  {
    name: 'Elena Rodriguez',
    category: 'Beauty & Lifestyle • 45k',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop',
  },
  {
    name: 'Jessica Thorne',
    category: 'Skincare Expert • 120k',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop',
  },
];

export const DiscoveryShortlist = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className={styles.title}>AI Discovery Shortlist</h3>
        </div>
        <p className={styles.subtitle}>
          Based on your “Summer Glow” campaign, we found 5 high-potential matches with 85%+ audience
          alignment.
        </p>
      </div>

      <div className={styles.list}>
        {SHORTLIST.map((item) => (
          <div key={item.name} className={styles.influencerCard}>
            <div className={styles.influencerInfo}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={40}
                  height={40}
                  className={styles.avatar}
                  unoptimized={true}
                />
              </div>
              <div className={styles.details}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.category}>{item.category}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className={styles.inviteBtn}>
              Invite
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
