import styles from './ActivityFeed.module.css';
import { Button } from '@/components/ui/Button';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  content: string;
  time: string;
  color: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New Lead Captured',
    content: 'Sarah Jenkins from Calendly',
    time: 'Just now',
    color: '#6C63FF',
  },
  {
    id: '2',
    type: 'nurture',
    title: 'Nurture Reply',
    content: 'David Wilson replied to Step 3',
    time: '12 mins ago',
    color: '#00BA88',
  },
  {
    id: '3',
    type: 'proposal',
    title: 'Proposal Generated',
    content: 'Acme Corp Enterprise draft ready',
    time: '45 mins ago',
    color: '#6C63FF',
  },
  {
    id: '4',
    type: 'call',
    title: 'Call Completed',
    content: 'Thomas K. (14 mins)',
    time: '1 hour ago',
    color: '#F4B740',
  },
];

export const ActivityFeed = () => {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Activity Feed</h3>
      <div className={styles.list}>
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className={styles.item}>
            <div className={styles.left}>
              <span className={styles.dot} style={{ backgroundColor: activity.color }} />
              <div className={styles.line} />
            </div>
            <div className={styles.content}>
              <h4 className={styles.itemTitle}>{activity.title}</h4>
              <p className={styles.itemText}>{activity.content}</p>
              <span className={styles.itemTime}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" className={styles.viewAllBtn} fullWidth>
        View all activities
      </Button>
    </div>
  );
};
