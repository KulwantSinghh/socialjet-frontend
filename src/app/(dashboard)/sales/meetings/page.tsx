import type { Metadata } from 'next';
import styles from './page.module.css';
import { MeetingsView } from './MeetingsView';

export const metadata: Metadata = {
  title: 'Meetings | SocialJet CRM',
};

export default function MeetingsPage() {
  return (
    <div className={styles.root}>
      <MeetingsView />
    </div>
  );
}
