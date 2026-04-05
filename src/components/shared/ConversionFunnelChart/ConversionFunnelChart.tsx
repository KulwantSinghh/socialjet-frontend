'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import styles from './ConversionFunnelChart.module.css';

const data = [
  { day: 'Mon', sent: 1850, opened: 1400, clicked: 2000 },
  { day: 'Tue', sent: 1200, opened: 900, clicked: 1150 },
  { day: 'Wed', sent: 2150, opened: 1600, clicked: 2050 },
  { day: 'Thu', sent: 1100, opened: 800, clicked: 1200 },
  { day: 'Fri', sent: 2550, opened: 1900, clicked: 1900 },
  { day: 'Sat', sent: 1600, opened: 1250, clicked: 1400 },
  { day: 'Sun', sent: 1300, opened: 1000, clicked: 700 },
];

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

export const ConversionFunnelChart = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversion Funnel</h3>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#C4B5FD' }} />
          Sent
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#8B5CF6' }} />
          Opened
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#3730A3' }} />
          Clicked
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
              ticks={[0, 500, 1000, 1500, 2000, 2500]}
              tickFormatter={(v: number) => (v === 0 ? '0' : `${v}`)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
            <Bar dataKey="sent" name="Sent" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar
              dataKey="opened"
              name="Opened"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="clicked"
              name="Clicked"
              fill="#3730A3"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
