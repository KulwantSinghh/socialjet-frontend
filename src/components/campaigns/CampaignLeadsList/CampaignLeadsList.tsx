'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styles from './CampaignLeadsList.module.css';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/roles.types';
import { leadsService } from '@/services/leads.service';
import { AssignModal } from '@/components/campaigns/AssignModal';
import type { Lead } from '@/types/leads.types';
import type { CampaignLead } from '@/types/campaign.types';

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  contact_form: 'Contact Form',
  calendly: 'Calendly',
  manual: 'Manual',
};

// Map sales status → campaign stage badge style
const STATUS_STYLE: Record<string, { label: string; styleKey: string }> = {
  new: { label: 'New', styleKey: 'stageNew' },
  contacted: { label: 'Contacted', styleKey: 'stageActive' },
  qualified: { label: 'Qualified', styleKey: 'stageActive' },
  proposal: { label: 'Proposal', styleKey: 'stageProgress' },
  onboarding: { label: 'Onboarding', styleKey: 'stageProgress' },
  closed: { label: 'Closed — Ready', styleKey: 'stageDone' },
};

function SkeletonRow() {
  return (
    <tr className={styles.tr}>
      {[160, 130, 160, 100, 80].map((w, i) => (
        <td key={i} className={styles.skeletonTd}>
          <div className={styles.shimmer} style={{ height: 16, width: w }} />
        </td>
      ))}
    </tr>
  );
}

export function CampaignLeadsList() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const isLead = role === UserRole.CampaignManagerLead;

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [assigningLead, setAssigningLead] = useState<CampaignLead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-closed-leads', search, sourceFilter],
    queryFn: () =>
      leadsService.getLeads({
        status: 'closed',
        search: search || undefined,
        source: sourceFilter || undefined,
      }),
    staleTime: 30_000,
  });

  const leads: Lead[] = data?.leads ?? [];

  // Client-side search filter (name, email, company)
  const filtered = search
    ? leads.filter((l) => {
        const q = search.toLowerCase();
        return (
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
        );
      })
    : leads;

  function getInitials(name: string) {
    return (name ?? '?')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Leads</h1>
          <p className={styles.subtitle}>
            {isLead
              ? 'Closed leads ready for campaign — assign and manage the team'
              : 'Your assigned campaign leads'}
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className={styles.searchInput}
              placeholder="Search by name, email or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="contact_form">Contact Form</option>
            <option value="calendly">Calendly</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Client</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Assigned CM</th>
              <th className={styles.th}>Source</th>
              <th className={styles.th}>Last Updated</th>
              {isLead && <th className={styles.th} />}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonRow key={i} />)
              : filtered.map((lead) => {
                  const statusInfo = STATUS_STYLE[lead.status] ?? {
                    label: lead.status,
                    styleKey: 'stageNew',
                  };
                  return (
                    <tr
                      key={lead.lead_id}
                      className={styles.tr}
                      onClick={() => router.push(`/campaigns/leads/${lead.lead_id}`)}
                    >
                      {/* Client */}
                      <td className={styles.td}>
                        <div className={styles.clientCell}>
                          <div className={styles.avatar}>{getInitials(lead.name)}</div>
                          <div>
                            <div className={styles.clientName}>{lead.name}</div>
                            {lead.company && (
                              <div className={styles.clientCompany}>{lead.company}</div>
                            )}
                            {lead.email && <div className={styles.clientCompany}>{lead.email}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className={styles.td}>
                        <span
                          className={`${styles.stageBadge} ${styles[statusInfo.styleKey as keyof typeof styles]}`}
                        >
                          <span className={styles.stageDot} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Assigned CM */}
                      <td className={styles.td}>
                        {lead.assigned_cm_id ? (
                          <div className={styles.assignedCell}>
                            <div className={styles.assignedAvatar}>CM</div>
                            <span className={styles.assignedName}>Assigned</span>
                          </div>
                        ) : (
                          <span className={styles.unassigned}>Unassigned</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className={styles.td}>{SOURCE_LABELS[lead.source] ?? lead.source}</td>

                      {/* Last updated */}
                      <td className={styles.td}>{formatDate(lead.updated_at)}</td>

                      {/* Assign action — CM Lead only */}
                      {isLead && (
                        <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={styles.assignRowBtn}
                            onClick={() =>
                              setAssigningLead({
                                id: lead.lead_id,
                                clientName: lead.name,
                                clientEmail: lead.email ?? '',
                                clientCompany: lead.company ?? '',
                                stage: 'unassigned',
                                priority: 'medium',
                                source: lead.source,
                                createdAt: lead.created_at,
                                updatedAt: lead.updated_at,
                                stageUpdatedAt: lead.updated_at,
                              })
                            }
                          >
                            {lead.assigned_cm_id ? 'Reassign' : 'Assign CM'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            {!isLoading && !filtered.length && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No closed leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {assigningLead && <AssignModal lead={assigningLead} onClose={() => setAssigningLead(null)} />}
    </div>
  );
}
