'use client';

import dynamic from 'next/dynamic';

export const CampaignHealthChartClient = dynamic(
  () => import('@/components/shared/CampaignHealthChart').then((m) => m.CampaignHealthChart),
  { ssr: false, loading: () => <div style={{ height: 280 }} /> }
);

export const RevenueROIChartClient = dynamic(
  () => import('@/components/shared/RevenueROIChart').then((m) => m.RevenueROIChart),
  { ssr: false, loading: () => <div style={{ height: 280 }} /> }
);
