import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Finance Dashboard' };

export default function FinanceDashboardPage() {
  return (
    <div>
      <h1>Finance Dashboard</h1>
      <p>Financial overview, revenue, and expense tracking will be displayed here.</p>
    </div>
  );
}
