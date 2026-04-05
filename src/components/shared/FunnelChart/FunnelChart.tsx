'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './FunnelChart.module.css';

const data = [
  { name: 'Leads Captured', value: 92, color: '#FCE5FF' },
  { name: 'Contacted', value: 105, color: '#FCE5FF' },
  { name: 'Qualified', value: 135, color: '#FCE5FF' },
  { name: 'Converted', value: 153, color: '#AA00FF' },
];

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#666"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const FunnelChart = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversion Funnel</h3>
        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button className={cn(styles.tab, styles.tabActive)}>Day</button>
            <button className={styles.tab}>Week</button>
            <button className={styles.tab}>Month</button>
          </div>
          <button className={styles.calendarBtn}>
            <CalendarIcon />
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            barSize={24}
          >
            <XAxis
              type="number"
              domain={[0, 160]}
              ticks={[0, 40, 80, 120, 160]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8E95A2' }}
              dy={10}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#8E95A2', fontWeight: 500 }}
              width={140}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="value" radius={12}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
