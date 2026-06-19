import styles from './AdminStatsCard.module.css';
import { cn } from '@/lib/utils';

export interface StatsBreakdownItem {
  label: string;
  value: number;
}

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  /** Optional compact breakdown shown as a muted footer (e.g. for Pending Approvals). */
  breakdown?: StatsBreakdownItem[];
}

export const AdminStatsCard = ({ label, value, trend, icon, breakdown }: AdminStatsCardProps) => {
  const isPositive = trend > 0;
  const isFlat = trend === 0;
  const visibleBreakdown = breakdown?.filter((item) => item.value > 0) ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span
          className={cn(
            styles.trend,
            isFlat ? styles.trendFlat : isPositive ? styles.trendUp : styles.trendDown
          )}
        >
          {isPositive ? '+' : ''}
          {trend}%
        </span>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <div className={styles.iconBox}>{icon}</div>
      </div>
      {visibleBreakdown.length > 0 && (
        <div className={styles.breakdown}>
          {visibleBreakdown.map((item) => (
            <span key={item.label} className={styles.breakdownItem}>
              <span className={styles.breakdownValue}>{item.value}</span> {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
