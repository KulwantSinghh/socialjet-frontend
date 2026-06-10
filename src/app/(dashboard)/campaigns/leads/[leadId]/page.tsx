'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import styles from './page.module.css';
import { useCampaignLeadDetail } from '@/hooks/useCampaignLeads';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/roles.types';
import { LeadTimeline } from '@/components/campaigns/LeadTimeline';
import { StagePanel } from '@/components/campaigns/StagePanel';
import { AssignModal } from '@/components/campaigns/AssignModal';
import type { CampaignLeadStage } from '@/types/campaign.types';

interface Props {
  params: Promise<{ leadId: string }>;
}

export default function LeadDetailPage({ params }: Props) {
  const { leadId } = use(params);
  const { data: lead, isLoading } = useCampaignLeadDetail(leadId);
  const [assignOpen, setAssignOpen] = useState(false);
  const role = useAuthStore((s) => s.role);
  const isLead = role === UserRole.CampaignManagerLead;

  const currentStage: CampaignLeadStage = lead?.stage ?? 'unassigned';

  // `activeStage` is the panel the user is viewing. It defaults to the lead's
  // actual stage (the one named by the API) and re-syncs whenever that stage
  // changes — e.g. when polling picks up a backend advance. User clicks override it.
  const [activeStage, setActiveStage] = useState<CampaignLeadStage | null>(null);
  const [syncedStage, setSyncedStage] = useState<CampaignLeadStage | null>(null);

  if (lead && lead.stage !== syncedStage) {
    setSyncedStage(lead.stage);
    setActiveStage(lead.stage);
  }

  const effectiveActiveStage = activeStage ?? currentStage;

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

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
          {isLead && lead && (
            <button className={styles.assignBtn} onClick={() => setAssignOpen(true)}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              {lead.assignedTo ? 'Reassign CM' : 'Assign CM'}
            </button>
          )}
          <button className={styles.messageBtn} onClick={() => toast('Under Development')}>
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
            activeStage={effectiveActiveStage}
            onSelectStage={setActiveStage}
          />
        </div>

        {/* Stage content (right) */}
        <div className={styles.contentCol}>
          <div className={styles.contentInner}>
            <StagePanel leadId={leadId} activeStage={effectiveActiveStage} />
          </div>
        </div>
      </div>

      {assignOpen && lead && <AssignModal lead={lead} onClose={() => setAssignOpen(false)} />}
    </div>
  );
}
