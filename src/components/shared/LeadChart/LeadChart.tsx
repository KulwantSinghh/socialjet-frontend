'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './LeadChart.module.css';

const data = [
  { name: 'Mon', newLeads: 12, qualified: 8, proposals: 5 },
  { name: 'Tue', newLeads: 18, qualified: 12, proposals: 7 },
  { name: 'Wed', newLeads: 15, qualified: 10, proposals: 8 },
  { name: 'Thu', newLeads: 22, qualified: 16, proposals: 11 },
  { name: 'Fri', newLeads: 17, qualified: 14, proposals: 12 },
  { name: 'Sat', newLeads: 20, qualified: 17, proposals: 13 },
  { name: 'Sun', newLeads: 19, qualified: 15, proposals: 11 },
];

export const LeadChart = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Lead Velocity & Pipeline</h3>
        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button className={cn(styles.tab, styles.tabActive)}>Day</button>
            <button className={styles.tab}>Week</button>
            <button className={styles.tab}>Month</button>
          </div>
          <button className={styles.calendarBtn}>📅</button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#8E95A2' }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E95A2' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="newLeads"
              name="New Leads"
              stroke="#6C63FF"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#6C63FF', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="qualified"
              name="Qualified"
              stroke="#00BA88"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#00BA88', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="proposals"
              name="Proposals"
              stroke="#F4B740"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F4B740', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legendContainer}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#6C63FF' }} />
          <span className={styles.legendText}>New Leads</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#00BA88' }} />
          <span className={styles.legendText}>Qualified</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#F4B740' }} />
          <span className={styles.legendText}>Proposals</span>
        </div>
      </div>
    </div>
  );
};

// Helper for class names
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
