'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './SourceChart.module.css';

const data = [
  { name: 'Whatsapp', value: 16, color: '#6C63FF' },
  { name: 'Web Form', value: 25, color: '#33E2A0' },
  { name: 'Calendly', value: 12, color: '#F7A83B' },
  { name: 'Contact', value: 9, color: '#FF7180' },
];

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  index?: number;
}

const renderCustomizedLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  index,
}: LabelProps) => {
  if (index !== 0) return null; // Only show 16% on Whatsapp (index 0)
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
      16%
    </text>
  );
};

export const SourceChart = () => {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Leads Sources</h3>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {data.map((entry) => (
          <div key={entry.name} className={styles.legendItem}>
            <div className={styles.legendLeft}>
              <div className={styles.dotIcon} style={{ borderColor: entry.color }}>
                <span className={styles.innerDot} style={{ backgroundColor: entry.color }} />
              </div>
              <span className={styles.name}>{entry.name}</span>
            </div>
            <span className={styles.val}>{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
