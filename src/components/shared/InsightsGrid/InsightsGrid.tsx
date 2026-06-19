import styles from './InsightsGrid.module.css';
import { InsightCard, type InsightStat } from '@/components/shared/InsightCard';
import type { DashboardInsights } from '@/types/dashboard.types';

interface InsightsGridProps {
  insights: DashboardInsights;
}

const num = (value: number) => value.toLocaleString('en-US');

const ROLE_LABELS: Record<string, string> = {
  client: 'Clients',
  admin: 'Admins',
  sales: 'Sales',
  campaign_manager: 'Campaign Mgrs',
  campaign_manager_lead: 'CM Leads',
};

const humanizeRole = (role: string) =>
  ROLE_LABELS[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ---- Icons (inline, server-safe) ----
const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const LeadsIcon = () => (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MeetingsIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const CreatorsIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8z" />
  </svg>
);
const OutreachIcon = () => (
  <svg {...iconProps}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);
const ContentIcon = () => (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 13h6M9 17h6" />
  </svg>
);
const TeamIcon = () => (
  <svg {...iconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const InsightsGrid = ({ insights }: InsightsGridProps) => {
  const { leads, meetings, creators, outreach, content, team } = insights;

  const teamStats: InsightStat[] = Object.entries(team.by_role)
    .filter(([, count]) => count > 0)
    .map(([role, count]) => ({ label: humanizeRole(role), value: count }));

  return (
    <div className={styles.grid}>
      <InsightCard
        icon={<LeadsIcon />}
        title="Leads"
        accent="#6C63FF"
        primaryValue={num(leads.total)}
        primaryCaption="total"
        stats={[
          { label: 'New this week', value: leads.new_this_week },
          { label: 'Closed won', value: leads.closed_won },
          { label: 'Conversion rate', value: `${leads.conversion_rate}%`, highlight: true },
        ]}
      />

      <InsightCard
        icon={<MeetingsIcon />}
        title="Meetings"
        accent="#3B82F6"
        primaryValue={num(meetings.total)}
        primaryCaption="total"
        stats={[
          { label: 'Calls done', value: meetings.calls_done },
          { label: 'Upcoming', value: meetings.upcoming, highlight: meetings.upcoming > 0 },
        ]}
      />

      <InsightCard
        icon={<CreatorsIcon />}
        title="Creators"
        accent="#F59E0B"
        primaryValue={num(creators.total)}
        primaryCaption="in network"
        stats={[{ label: 'AI matches', value: num(creators.ai_matches), highlight: true }]}
      />

      <InsightCard
        icon={<OutreachIcon />}
        title="Outreach"
        accent="#22C55E"
        primaryValue={`${outreach.reply_rate}%`}
        primaryCaption="reply rate"
        stats={[
          { label: 'Sent', value: outreach.sent },
          { label: 'Replies', value: outreach.replies, highlight: outreach.replies > 0 },
        ]}
      />

      <InsightCard
        icon={<ContentIcon />}
        title="Content"
        accent="#8B5CF6"
        primaryValue={num(content.total)}
        primaryCaption="items"
        stats={[
          { label: 'Submitted', value: content.submitted },
          { label: 'CM approved', value: content.cm_approved },
          { label: 'Client approved', value: content.client_approved },
          { label: 'Scheduled', value: content.scheduled, highlight: content.scheduled > 0 },
        ]}
      />

      <InsightCard
        icon={<TeamIcon />}
        title="Team"
        accent="#EC4899"
        primaryValue={num(team.total)}
        primaryCaption="members"
        stats={teamStats}
      />
    </div>
  );
};
