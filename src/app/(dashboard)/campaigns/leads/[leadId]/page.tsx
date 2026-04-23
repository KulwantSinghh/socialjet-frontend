'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import styles from './page.module.css';
import { useCampaignLeadDetail } from '@/hooks/useCampaignLeads';
import { LeadTimeline } from '@/components/campaigns/LeadTimeline';
import { StagePanel } from '@/components/campaigns/StagePanel';
import { ChatSlideIn } from '@/components/campaigns/ChatSlideIn';
import type { CampaignLeadStage } from '@/types/campaign.types';

interface Props {
  params: Promise<{ leadId: string }>;
}

export default function LeadDetailPage({ params }: Props) {
  const { leadId } = use(params);
  const { data: lead, isLoading } = useCampaignLeadDetail(leadId);
  const [activeStage, setActiveStage] = useState<CampaignLeadStage>('assigned');
  const [chatOpen, setChatOpen] = useState(false);

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  const currentStage: CampaignLeadStage = lead?.stage ?? 'unassigned';

  return (
    <div className={styles.root}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <Link href="/campaigns/leads" className={styles.backBtn}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Leads
        </Link>

        <div className={styles.clientInfo}>
          {isLoading ? (
            <>
              <div
                className={styles.shimmer}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.shimmer} style={{ height: 18, width: 160 }} />
                <div className={styles.shimmer} style={{ height: 14, width: 100 }} />
              </div>
            </>
          ) : lead ? (
            <>
              <div className={styles.clientAvatar}>{getInitials(lead.clientName)}</div>
              <div>
                <div className={styles.clientName}>{lead.clientName}</div>
                <div className={styles.clientCompany}>
                  {lead.clientCompany} · {lead.clientEmail}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className={styles.topBarActions}>
          {lead && <span className={styles.stagePill}>{lead.stage.replace(/_/g, ' ')}</span>}
          <button className={styles.messageBtn} onClick={() => setChatOpen(true)}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message Client
          </button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className={styles.body}>
        {/* Timeline (left) */}
        <div className={styles.timelineCol}>
          <LeadTimeline
            currentStage={currentStage}
            activeStage={activeStage}
            onSelectStage={setActiveStage}
          />
        </div>

        {/* Stage content (right) */}
        <div className={styles.contentCol}>
          <div className={styles.contentInner}>
            <StagePanel leadId={leadId} activeStage={activeStage} />
          </div>
        </div>
      </div>

      {/* Chat slide-in */}
      {lead && (
        <ChatSlideIn
          leadId={leadId}
          clientName={lead.clientName}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
