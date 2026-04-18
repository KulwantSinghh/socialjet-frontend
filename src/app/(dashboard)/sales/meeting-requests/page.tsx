import type { Metadata } from 'next';
import styles from './page.module.css';
import { MeetingRequestsView } from './MeetingRequestsView';

export const metadata: Metadata = {
  title: 'Meeting Approvals | SocialJet CRM',
};

export default function MeetingRequestsPage() {
  return (
    <div className={styles.root}>
      <MeetingRequestsView />
    </div>
  );
}
