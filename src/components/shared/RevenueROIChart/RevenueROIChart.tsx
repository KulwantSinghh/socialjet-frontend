'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './RevenueROIChart.module.css';
import type { RevenueTrendPoint } from '@/types/dashboard.types';

interface RevenueROIChartProps {
  data: RevenueTrendPoint[];
}

const formatYAxis = (value: number) => {
  if (value >= 1000) return `$${value / 1000}k`;
  return `$${value}`;
};

export const RevenueROIChart = ({ data }: RevenueROIChartProps) => {
  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Revenue &amp; ROI Trend</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6c63ff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value: unknown) => [`$${(value as number).toLocaleString()}`, 'Revenue']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6c63ff"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#6c63ff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
