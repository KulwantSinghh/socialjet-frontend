'use client';

import { useState } from 'react';
import styles from './MyTasksPanel.module.css';
import { cn } from '@/lib/utils';
import type { DashboardTask, TaskPriority } from '@/types/dashboard.types';

interface MyTasksPanelProps {
  tasks: DashboardTask[];
}

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  'High Priority': styles.priorityHigh,
  'Due Today': styles.priorityDue,
  Normal: styles.priorityNormal,
};

const ActionButton = ({ label, icon }: { label: string; icon: DashboardTask['action_icon'] }) => (
  <button className={cn(styles.actionBtn, icon === 'send' && styles.actionBtnGreen)}>
    {icon === 'ai' && <span className={styles.actionIcon}>✦</span>}
    {icon === 'send' && <span className={styles.actionIcon}>↗</span>}
    {label}
  </button>
);

export const MyTasksPanel = ({ tasks }: MyTasksPanelProps) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>≡</span>
          <h3 className={styles.title}>My Tasks</h3>
        </div>
        {tasks.length > 0 && <span className={styles.count}>{tasks.length}</span>}
      </div>

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>✓</span>
          <p className={styles.emptyText}>You&#39;re all caught up. No tasks need attention.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {tasks.map((task) => (
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
                <ActionButton label={task.action_label} icon={task.action_icon} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
