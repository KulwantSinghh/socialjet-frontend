'use client';

/**
 * Thin client wrapper that lazy-loads the heavy Recharts chart.
 * Keeps the parent page a Server Component while enabling ssr:false.
 */
import dynamic from 'next/dynamic';
import styles from './ConversionFunnelChart.module.css';

const ConversionFunnelChartInner = dynamic(
  () =>
    import('./ConversionFunnelChart').then((m) => ({
      default: m.ConversionFunnelChart,
    })),
  {
    ssr: false,
    loading: () => <div className={styles.chartSkeleton} />,
  }
);

export const ConversionFunnelChartClient = () => <ConversionFunnelChartInner />;
