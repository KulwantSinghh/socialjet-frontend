import styles from './loading.module.css';

export default function NurtureLoading() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </header>

      <section className={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </section>

      <div className={styles.chartSkeleton} />
      <div className={styles.agentsSkeleton} />
    </div>
  );
}
