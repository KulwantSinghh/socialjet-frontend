'use client';

import { useState } from 'react';
import styles from './AssignModal.module.css';
import { useCampaignManagers, useAssignLead } from '@/hooks/useCampaignLeads';
import type { CampaignLead } from '@/types/campaign.types';

interface Props {
  lead: CampaignLead;
  onClose: () => void;
}

export function AssignModal({ lead, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string>(lead.assignedTo?.id ?? '');
  const { data: managers, isLoading } = useCampaignManagers();
  const { mutate: assign, isPending } = useAssignLead();

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function getWorkloadClass(count: number) {
    if (count <= 5) return styles.workloadLow;
    if (count <= 10) return styles.workloadMed;
    return styles.workloadHigh;
  }

  function getWorkloadLabel(count: number) {
    return `${count} lead${count !== 1 ? 's' : ''}`;
  }

  function handleAssign() {
    if (!selectedId) return;
    assign({ leadId: lead.id, managerId: selectedId }, { onSuccess: onClose });
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Assign Lead</h2>
            <p className={styles.subtitle}>
              {lead.clientName} · {lead.clientCompany}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className={styles.cmCard} style={{ cursor: 'default' }}>
                  <div
                    className={styles.shimmer}
                    style={{ width: 42, height: 42, borderRadius: '50%' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className={styles.shimmer} style={{ height: 14, width: '45%' }} />
                    <div className={styles.shimmer} style={{ height: 11, width: '65%' }} />
                  </div>
                  <div
                    className={styles.shimmer}
                    style={{ height: 22, width: 60, borderRadius: 999 }}
                  />
                </div>
              ))
            : (managers ?? []).map((cm) => (
                <div
                  key={cm.id}
                  className={`${styles.cmCard} ${selectedId === cm.id ? styles.cmCardSelected : ''}`}
                  onClick={() => setSelectedId(cm.id)}
                >
                  <div className={styles.cmAvatar}>{getInitials(cm.name)}</div>
                  <div className={styles.cmInfo}>
                    <div className={styles.cmName}>{cm.name}</div>
                    <div className={styles.cmEmail}>{cm.email}</div>
                  </div>
                  <span className={`${styles.workloadBadge} ${getWorkloadClass(cm.activeLeads)}`}>
                    {getWorkloadLabel(cm.activeLeads)}
                  </span>
                </div>
              ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.assignBtn}
            disabled={!selectedId || isPending}
            onClick={handleAssign}
          >
            {isPending ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
