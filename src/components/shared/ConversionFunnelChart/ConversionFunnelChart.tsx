'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import styles from './ConversionFunnelChart.module.css';
import type { FunnelDay } from '@/types/nurture.types';

interface ChartRow {
  day: string;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
}

const FALLBACK_DATA: ChartRow[] = [
  { day: 'Mon', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Tue', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Wed', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Thu', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Fri', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Sat', new: 0, contacted: 0, qualified: 0, converted: 0 },
  { day: 'Sun', new: 0, contacted: 0, qualified: 0, converted: 0 },
];

function toChartData(funnel: Record<string, FunnelDay>): ChartRow[] {
  return Object.entries(funnel).map(([day, vals]) => ({ day, ...vals }));
}

export interface ConversionFunnelChartProps {
  conversionFunnel?: Record<string, FunnelDay>;
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: entry.color }} />
            {entry.name}: <strong>{entry.value?.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ConversionFunnelChart = ({ conversionFunnel }: ConversionFunnelChartProps) => {
  const data = conversionFunnel ? toChartData(conversionFunnel) : FALLBACK_DATA;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversion Funnel</h3>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#C4B5FD' }} />
          New
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#8B5CF6' }} />
          Contacted
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#3730A3' }} />
          Qualified
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#1E1B4B' }} />
          Converted
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
            <Bar dataKey="new" name="New" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar
              dataKey="contacted"
              name="Contacted"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="qualified"
              name="Qualified"
              fill="#3730A3"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="converted"
              name="Converted"
              fill="#1E1B4B"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
