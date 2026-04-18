'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './CampaignHealthChart.module.css';

const data = [
  { name: 'Delayed', value: 4, color: '#6c63ff' },
  { name: 'On Track', value: 2, color: '#ef4444' },
  { name: 'At Risk', value: 6, color: '#22c55e' },
  { name: 'Pending', value: 12, color: '#f59e0b' },
];

export const CampaignHealthChart = () => {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Campaign Health</h3>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [value as number, 'Campaign']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>16%</span>
        </div>
      </div>
      <div className={styles.legend}>
        {data.map((item) => (
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
