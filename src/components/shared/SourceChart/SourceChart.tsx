'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './SourceChart.module.css';
import { useLeadStats } from '@/hooks/useLeadStats';

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: '#6C63FF',
  contact_form: '#33E2A0',
  calendly: '#F7A83B',
  manual: '#FF7180',
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'Whatsapp',
  contact_form: 'Web Form',
  calendly: 'Calendly',
  manual: 'Manual',
};

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
}

const renderCustomizedLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
  index,
}: LabelProps) => {
  if (index !== 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="11"
      fontWeight="700"
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export const SourceChart = () => {
  const { data: statsData, isLoading } = useLeadStats();

  const chartData = statsData
    ? Object.entries(statsData.by_source).map(([key, count]) => ({
        name: SOURCE_LABELS[key] ?? key,
        value: count,
        color: SOURCE_COLORS[key] ?? '#A0AEC0',
      }))
    : [];

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Leads Sources</h3>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={
                isLoading || chartData.length === 0
                  ? [{ name: 'Loading', value: 1, color: '#e2e8f0' }]
                  : chartData
              }
              innerRadius={55}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={isLoading ? undefined : renderCustomizedLabel}
            >
              {(isLoading || chartData.length === 0 ? [{ color: '#e2e8f0' }] : chartData).map(
                (entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                )
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {chartData.map((entry) => (
          <div key={entry.name} className={styles.legendItem}>
            <div className={styles.legendLeft}>
              <div className={styles.dotIcon} style={{ borderColor: entry.color }}>
                <span className={styles.innerDot} style={{ backgroundColor: entry.color }} />
              </div>
              <span className={styles.name}>{entry.name}</span>
            </div>
            <span className={styles.val}>
              {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
