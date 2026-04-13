import styles from './AdminStatsCard.module.css';
import { cn } from '@/lib/utils';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  trendLabel?: string;
}

export const AdminStatsCard = ({
  label,
  value,
  trend,
  icon,
  trendLabel: _trendLabel,
}: AdminStatsCardProps) => {
  const isPositive = trend > 0;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={cn(styles.trend, isPositive ? styles.trendUp : styles.trendDown)}>
          {isPositive ? '+' : ''}
          {trend}%
        </span>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <div className={styles.iconBox}>{icon}</div>
      </div>
    </div>
  );
};
