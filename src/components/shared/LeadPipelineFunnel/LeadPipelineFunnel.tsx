import styles from './LeadPipelineFunnel.module.css';
import type { LeadPipelineStage } from '@/types/dashboard.types';

interface LeadPipelineFunnelProps {
  stages: LeadPipelineStage[];
}

const STAGE_META: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#6C63FF' },
  nurturing: { label: 'Nurturing', color: '#8B5CF6' },
  meeting: { label: 'Meeting', color: '#3B82F6' },
  proposal: { label: 'Proposal', color: '#F59E0B' },
  closed_won: { label: 'Closed Won', color: '#22C55E' },
  dead: { label: 'Dead', color: '#94A3B8' },
};

export const LeadPipelineFunnel = ({ stages }: LeadPipelineFunnelProps) => {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  const total = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Lead Pipeline</h3>
        <span className={styles.total}>{total} leads</span>
      </div>

      <div className={styles.rows}>
        {stages.map((stage) => {
          const meta = STAGE_META[stage.stage] ?? { label: stage.stage, color: '#94A3B8' };
          const widthPct = Math.round((stage.count / maxCount) * 100);
          return (
            <div key={stage.stage} className={styles.row}>
              <span className={styles.stageLabel}>{meta.label}</span>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${stage.count === 0 ? 0 : Math.max(widthPct, 4)}%`,
                    background: meta.color,
                  }}
                />
              </div>
              <span className={styles.count}>{stage.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
