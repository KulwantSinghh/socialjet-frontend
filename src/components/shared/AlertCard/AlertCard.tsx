import styles from './AlertCard.module.css';
import { Button } from '@/components/ui/Button';

export const AlertCard = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.0225 15L6 6.75C6 4.35 6 3 8.25 3C10.5 3 10.5 4.35 10.5 6.75C10.5 9.15 10.5 10.5 12.75 10.5C15 10.5 15 9.15 15 6.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.5 15H15M2.5 15V3L4.5 4.5L6.5 3V15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.titleWrapper}>
          <h4 className={styles.title}>Flagged Interaction</h4>
          <p className={styles.description}>
            Call with <strong>Lisa M.</strong>, detected high negative sentiment during pricing
            discussion.
          </p>
        </div>
      </div>
      <div className={styles.footer}>
        <Button className={styles.actionBtn} size="sm">
          Listen to recording
        </Button>
      </div>
    </div>
  );
};
