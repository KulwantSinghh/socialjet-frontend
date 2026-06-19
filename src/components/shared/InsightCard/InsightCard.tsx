import styles from './InsightCard.module.css';

export interface InsightStat {
  label: string;
  value: string | number;
  /** Optional accent on the value (e.g. for a rate). */
  highlight?: boolean;
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  /** Icon tint color (hex). */
  accent: string;
  primaryValue: string | number;
  primaryCaption: string;
  stats: InsightStat[];
}

export const InsightCard = ({
  icon,
  title,
  accent,
  primaryValue,
  primaryCaption,
  stats,
}: InsightCardProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.iconBox} style={{ color: accent, background: `${accent}14` }}>
          {icon}
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.primary}>
        <span className={styles.primaryValue}>{primaryValue}</span>
        <span className={styles.primaryCaption}>{primaryCaption}</span>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statRow}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span
              className={styles.statValue}
              style={stat.highlight ? { color: accent } : undefined}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
