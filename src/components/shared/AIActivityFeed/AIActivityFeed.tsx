import styles from './AIActivityFeed.module.css';

interface FeedItem {
  id: string;
  category: string;
  categoryColor: string;
  time: string;
  description: string;
  note?: string;
  actionLabel: string;
  avatars?: string[];
  matchBadge?: string;
}

const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    category: 'Discovery',
    categoryColor: '#22c55e',
    time: '10 mins ago',
    description: 'Found 15 new influencers matching "TechLaunch" criteria.',
    actionLabel: 'Review matches',
    avatars: [
      'https://i.pravatar.cc/24?img=1',
      'https://i.pravatar.cc/24?img=2',
      'https://i.pravatar.cc/24?img=3',
    ],
    matchBadge: '92% Match',
  },
  {
    id: '2',
    category: 'Content Analysis',
    categoryColor: '#6c63ff',
    time: '10 mins ago',
    description: 'Analyzed draft video from @SarahCreates.',
    note: '⚠ Missing brand hashtag #LuminaGlow',
    actionLabel: 'Review & Send Drafts',
  },
  {
    id: '3',
    category: 'Outreach',
    categoryColor: '#6c63ff',
    time: '10 mins ago',
    description: 'Drafted 8 personalized follow-up emails for unresponsive leads.',
    actionLabel: 'Review & Send Drafts',
  },
];

export const AIActivityFeed = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.lightning}>⚡</span>
        <h3 className={styles.title}>AI Activity Feed</h3>
      </div>

      <div className={styles.list}>
        {FEED_ITEMS.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.itemMeta}>
                <span className={styles.dot} style={{ background: item.categoryColor }} />
                <span className={styles.category} style={{ color: item.categoryColor }}>
                  {item.category}
                </span>
              </div>
              <span className={styles.time}>{item.time}</span>
            </div>
            <p className={styles.description}>{item.description}</p>
            {item.avatars && (
              <div className={styles.avatarRow}>
                {item.avatars.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="avatar" className={styles.avatar} />
                ))}
                {item.matchBadge && <span className={styles.matchBadge}>✓ {item.matchBadge}</span>}
              </div>
            )}
            {item.note && <p className={styles.note}>{item.note}</p>}
            <button className={styles.actionLink}>{item.actionLabel}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
