'use client';

import styles from './LeadTimeline.module.css';
import type { CampaignLeadStage } from '@/types/campaign.types';

interface TimelineStage {
  key: CampaignLeadStage;
  label: string;
  group: string;
}

const STAGES: TimelineStage[] = [
  { key: 'unassigned', label: 'Unassigned', group: 'Lead' },
  { key: 'assigned', label: 'Assigned', group: 'Lead' },
  { key: 'questionnaire_sent', label: 'Questionnaire Sent', group: 'Onboarding' },
  { key: 'questionnaire_received', label: 'Questionnaire Received', group: 'Onboarding' },
  { key: 'meeting_booked', label: 'Meeting Booked', group: 'Meeting' },
  { key: 'meeting_done', label: 'Meeting Done', group: 'Meeting' },
  { key: 'documents_generated', label: 'Documents Generated', group: 'Documents' },
  { key: 'documents_cm_approved', label: 'CM Approved', group: 'Documents' },
  { key: 'documents_admin_approved', label: 'Admin Approved', group: 'Documents' },
  { key: 'documents_sent_to_client', label: 'Sent to Client', group: 'Documents' },
  { key: 'influencer_selection', label: 'Influencer Selection', group: 'Influencers' },
  { key: 'influencer_cm_approved', label: 'CM Approved', group: 'Influencers' },
  { key: 'influencer_client_approved', label: 'Client Approved', group: 'Influencers' },
  { key: 'deal_negotiation', label: 'Deal Negotiation', group: 'Deal' },
  { key: 'deal_closed', label: 'Deal Closed', group: 'Deal' },
  { key: 'client_informed', label: 'Client Informed', group: 'Deal' },
  { key: 'content_review', label: 'Content Review', group: 'Content' },
  { key: 'content_cm_approved', label: 'CM Approved', group: 'Content' },
  { key: 'content_client_approved', label: 'Client Approved', group: 'Content' },
  { key: 'publish_date_assigned', label: 'Date Assigned', group: 'Content' },
  { key: 'live', label: 'Live', group: 'Live' },
  { key: 'complete', label: 'Complete', group: 'Live' },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

function stageStatus(
  currentStage: CampaignLeadStage,
  itemStage: CampaignLeadStage
): 'complete' | 'active' | 'pending' {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const itemIdx = STAGE_ORDER.indexOf(itemStage);
  if (itemIdx < currentIdx) return 'complete';
  if (itemIdx === currentIdx) return 'active';
  return 'pending';
}

interface Props {
  currentStage: CampaignLeadStage;
  activeStage: CampaignLeadStage;
  onSelectStage: (stage: CampaignLeadStage) => void;
  stageDates?: Partial<Record<CampaignLeadStage, string>>;
}

export function LeadTimeline({ currentStage, activeStage, onSelectStage, stageDates }: Props) {
  const groups = STAGES.reduce<Record<string, TimelineStage[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  return (
    <div className={styles.root}>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <div className={styles.groupLabel}>{group}</div>
          {items.map((item) => {
            const status = stageStatus(currentStage, item.key);
            const isActive = activeStage === item.key;
            return (
              <button
                key={item.key}
                className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                onClick={() => onSelectStage(item.key)}
              >
                <div
                  className={`${styles.dot} ${status === 'complete' ? styles.dotComplete : status === 'active' ? styles.dotActive : styles.dotPending}`}
                >
                  {status === 'complete' && (
                    <svg
                      className={styles.checkIcon}
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  {status === 'active' && <div className={styles.pulseRing} />}
                </div>
                <div className={styles.itemContent}>
                  <div
                    className={`${styles.itemLabel} ${status === 'pending' ? styles.itemLabelPending : ''}`}
                  >
                    {item.label}
                  </div>
                  {stageDates?.[item.key] && (
                    <div className={styles.itemDate}>
                      {new Date(stageDates[item.key]!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
