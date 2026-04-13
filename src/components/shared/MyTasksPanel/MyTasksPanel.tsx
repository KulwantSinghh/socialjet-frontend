'use client';

import { useState } from 'react';
import styles from './MyTasksPanel.module.css';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  subtitle: string;
  priority: 'High Priority' | 'Due Today' | 'Normal' | 'Chase';
  actionLabel: string;
  actionIcon?: 'review' | 'send' | 'ai';
}

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Review Content: TechLaunch Campaign',
    subtitle: '3 influencers have submitted drafts for approval.',
    priority: 'High Priority',
    actionLabel: 'Review Drafts',
    actionIcon: 'review',
  },
  {
    id: '2',
    title: 'Send Proposal: Nike Summer Vibe',
    subtitle: 'Proposal is ready. Waiting for final send to client.',
    priority: 'Due Today',
    actionLabel: 'Send to Client',
    actionIcon: 'send',
  },
  {
    id: '3',
    title: 'Reply to Outreach',
    subtitle: '12 new replies in your outreach inbox.',
    priority: 'Normal',
    actionLabel: 'Generate AI Replies',
    actionIcon: 'ai',
  },
  {
    id: '4',
    title: 'WOW Vitamin C: invoice payment pending (₹4.25L)',
    subtitle: '12 new replies in your outreach inbox.',
    priority: 'Chase',
    actionLabel: 'Generate AI Replies',
    actionIcon: 'ai',
  },
];

const PRIORITY_CLASS: Record<Task['priority'], string> = {
  'High Priority': styles.priorityHigh,
  'Due Today': styles.priorityDue,
  Normal: styles.priorityNormal,
  Chase: styles.priorityChase,
};

const ActionButton = ({ label, icon }: { label: string; icon?: string }) => (
  <button className={cn(styles.actionBtn, icon === 'send' && styles.actionBtnGreen)}>
    {icon === 'ai' && <span className={styles.actionIcon}>✦</span>}
    {icon === 'send' && <span className={styles.actionIcon}>↗</span>}
    {label}
  </button>
);

export const MyTasksPanel = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>≡</span>
          <h3 className={styles.title}>My Tasks</h3>
        </div>
        <div className={styles.searchRow}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className={styles.searchLabel}>Search</span>
        </div>
      </div>

      <div className={styles.list}>
        {TASKS.map((task) => (
          <div
            key={task.id}
            className={cn(styles.taskItem, checked[task.id] && styles.taskChecked)}
          >
            <div className={styles.taskLeft}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={!!checked[task.id]}
                onChange={() => toggle(task.id)}
                id={`task-${task.id}`}
              />
            </div>
            <div className={styles.taskContent}>
              <div className={styles.taskTop}>
                <label htmlFor={`task-${task.id}`} className={styles.taskTitle}>
                  {task.title}
                </label>
                <span className={cn(styles.priorityBadge, PRIORITY_CLASS[task.priority])}>
                  {task.priority}
                </span>
              </div>
              <p className={styles.taskSubtitle}>{task.subtitle}</p>
              <ActionButton label={task.actionLabel} icon={task.actionIcon} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAll}>View All</button>
      </div>
    </div>
  );
};
