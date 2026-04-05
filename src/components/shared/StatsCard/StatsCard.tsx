import styles from './StatsCard.module.css';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  trendIcon?: React.ReactNode;
}

export const StatsCard = ({ label, value, trend, icon, trendIcon }: StatsCardProps) => {
  const isPositive = trend > 0;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={cn(styles.trend, isPositive ? styles.trendPositive : styles.trendNegative)}>
          {trendIcon || (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d={
                  isPositive ? 'M1 9L5 5L7 7L11 3M11 3H8M11 3V6' : 'M1 3L5 7L7 5L11 9M11 9H8M11 9V6'
                }
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className={styles.trendText}>
            {isPositive ? '+' : ''}
            {trend}%
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.value}>{value}</span>
        <div className={styles.iconWrapper}>{icon}</div>
      </div>
    </div>
  );
};
