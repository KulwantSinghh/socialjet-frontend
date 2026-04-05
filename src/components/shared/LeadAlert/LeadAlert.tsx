import styles from './LeadAlert.module.css';
import { Button } from '@/components/ui/Button';

export const LeadAlert = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.icon}>⚡</span>
          <h3 className={styles.title}>New Lead Alerts</h3>
        </div>
        <span className={styles.badge}>Last 24h</span>
      </div>

      <div className={styles.card}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          <div className={styles.details}>
            <h4 className={styles.userName}>Sarah Jenkins • TechCorp</h4>
            <p className={styles.userRole}>Pricing Inquiry - Enterprise Plan</p>
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span className={styles.metaValue}>New</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Source:</span>
            <span className={styles.metaValue}>Whatsapp</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button className={styles.fastTrackBtn}>Fast Track</Button>
          <span className={styles.time}>2 mins ago</span>
        </div>
      </div>
    </div>
  );
};
