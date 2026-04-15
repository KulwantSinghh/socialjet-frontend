import styles from './loading.module.css';

export default function SalesDashboardLoading() {
  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </header>

      {/* Stats Row */}
      <section className={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </section>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        <div className={styles.chartSkeleton} />
        <div className={styles.activitySkeleton} />
      </div>
    </div>
  );
}
