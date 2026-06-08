'use client';

import styles from './CampaignInboxPage.module.css';
import { OutreachInbox } from '@/components/campaigns/OutreachInbox';

interface CampaignInboxPageProps {
  initialLeadId?: string;
  initialCreatorId?: string;
  initialTab?: string;
}

export function CampaignInboxPage({ initialLeadId, initialCreatorId }: CampaignInboxPageProps) {
  return (
    <div className={styles.root}>
      <OutreachInbox initialLeadId={initialLeadId} initialCreatorId={initialCreatorId} />
    </div>
  );
}
