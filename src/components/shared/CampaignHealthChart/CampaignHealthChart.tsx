'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './CampaignHealthChart.module.css';
import type { CampaignHealthSegment } from '@/types/dashboard.types';

interface CampaignHealthChartProps {
  segments: CampaignHealthSegment[];
  onTrackPct: number;
  total: number;
}

const EMPTY_RING = [{ name: 'No campaigns', value: 1, color: 'var(--color-neutral-200)' }];

export const CampaignHealthChart = ({ segments, onTrackPct, total }: CampaignHealthChartProps) => {
  const hasData = total > 0 && segments.some((s) => s.value > 0);
  const ringData = hasData ? segments : EMPTY_RING;

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Campaign Health</h3>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={ringData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={hasData ? 2 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {ringData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            {hasData && (
              <Tooltip
                formatter={(value: unknown, name: unknown) => [value as number, name as string]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>{onTrackPct}%</span>
          <span className={styles.centerCaption}>on track</span>
        </div>
      </div>
      <div className={styles.legend}>
        {segments.map((item) => (
          <div key={item.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: item.color }} />
            <span className={styles.legendName}>{item.name}</span>
            <span className={styles.legendValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
