import styles from './loading.module.css';

export default function LeadCaptureLoading() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </header>

      <div className={styles.alertSkeleton} />

      <section className={styles.statsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </section>

      <div className={styles.chartsGrid}>
        <div className={styles.chartSmall} />
        <div className={styles.chartLarge} />
      </div>

      <div className={styles.tableSkeleton} />
    </div>
  );
}
