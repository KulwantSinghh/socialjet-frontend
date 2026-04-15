import styles from './loading.module.css';

export default function SalesIntelligenceLoading() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.subtitleSkeleton} />
      </header>

      <section className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </section>

      <div className={styles.listSkeleton} />
    </div>
  );
}
