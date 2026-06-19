import styles from './AIActivityFeed.module.css';
import type { AIActivityItem } from '@/types/dashboard.types';

interface AIActivityFeedProps {
  items: AIActivityItem[];
}

export const AIActivityFeed = ({ items }: AIActivityFeedProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.lightning}>⚡</span>
        <h3 className={styles.title}>AI Activity Feed</h3>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No recent AI activity yet.</p>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <div className={styles.itemMeta}>
                  <span className={styles.dot} style={{ background: item.category_color }} />
                  <span className={styles.category} style={{ color: item.category_color }}>
                    {item.category}
                  </span>
                </div>
                <span className={styles.time}>{item.time}</span>
              </div>
              <p className={styles.description}>{item.description}</p>
              <button className={styles.actionLink}>{item.action_label}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
