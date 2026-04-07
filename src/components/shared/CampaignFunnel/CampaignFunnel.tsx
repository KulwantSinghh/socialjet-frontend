'use client';

import { useState } from 'react';
import styles from './CampaignFunnel.module.css';
import { cn } from '@/lib/utils';

const FUNNEL_DATA = [
  { label: 'Active', value: 1200, width: '15%' },
  { label: 'Identified', value: 850, width: '45%' },
  { label: 'Contacted', value: 420, width: '55%' },
  { label: 'Interested', value: 180, width: '75%' },
  { label: 'Contracted', value: 142, width: '85%' },
];

export const CampaignFunnel = () => {
  const [activeTab, setActiveTab] = useState('Day');

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Campaign Outreach Funnel</h3>
        <div className={styles.controls}>
          <div className={styles.tabs}>
            {['Day', 'Week', 'Month'].map((tab) => (
              <button
                key={tab}
                className={cn(styles.tab, activeTab === tab && styles.tabActive)}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className={styles.calendarBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.chart}>
        {FUNNEL_DATA.map((item) => (
          <div key={item.label} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <div className={styles.barWrapper}>
              <div
                className={cn(styles.bar, item.label === 'Contracted' && styles.barPrimary)}
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
        <div className={styles.axis}>
          {FUNNEL_DATA.map((item) => (
            <span key={item.value} className={styles.axisValue}>
              {item.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
