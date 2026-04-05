import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const AlertBanner = ({ message, onDismiss }: AlertBannerProps) => {
  return (
    <div className={styles.root}>
      <p>
        {message}{' '}
        <button className={styles.dismissBtn} onClick={onDismiss}>
          Dismiss
        </button>
      </p>
    </div>
  );
};
