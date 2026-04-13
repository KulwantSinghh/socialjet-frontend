'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './FunnelChart.module.css';
import { useLeadFunnel } from '@/hooks/useLeadFunnel';
import type { FunnelPeriod } from '@/types/leads.types';

const PERIODS: { label: string; value: FunnelPeriod }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const BAR_COLORS = {
  default: '#FCE5FF',
  converted: '#AA00FF',
};

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

function getNiceDomain(max: number): { domainMax: number; ticks: number[] } {
  if (max === 0) return { domainMax: 10, ticks: [0, 2, 4, 6, 8, 10] };
  const step = Math.ceil(max / 4 / 10) * 10 || 10;
  const domainMax = Math.ceil(max / step) * step + step;
  const ticks: number[] = [];
  for (let i = 0; i <= domainMax; i += step) ticks.push(i);
  return { domainMax, ticks };
}

export const FunnelChart = () => {
  const [activePeriod, setActivePeriod] = useState<FunnelPeriod>('month');
  const { data, isLoading } = useLeadFunnel(activePeriod);

  const chartData = data
    ? [
        { name: 'Leads Captured', value: data.funnel.leads_captured, color: BAR_COLORS.default },
        { name: 'Contacted', value: data.funnel.contacted, color: BAR_COLORS.default },
        { name: 'Qualified', value: data.funnel.qualified, color: BAR_COLORS.default },
        { name: 'Converted', value: data.funnel.converted, color: BAR_COLORS.converted },
      ]
    : [
        { name: 'Leads Captured', value: 0, color: BAR_COLORS.default },
        { name: 'Contacted', value: 0, color: BAR_COLORS.default },
        { name: 'Qualified', value: 0, color: BAR_COLORS.default },
        { name: 'Converted', value: 0, color: BAR_COLORS.converted },
      ];

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const { domainMax, ticks } = getNiceDomain(maxValue);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversion Funnel</h3>
        <div className={styles.controls}>
          <div className={styles.tabs}>
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                className={cn(styles.tab, activePeriod === value && styles.tabActive)}
                onClick={() => setActivePeriod(value)}
              >
                {label}
              </button>
            ))}
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
            data={chartData}
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            barSize={24}
          >
            <XAxis
              type="number"
              domain={[0, domainMax]}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: isLoading ? '#d1d5db' : '#8E95A2' }}
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
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={isLoading ? '#f3f4f6' : entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
