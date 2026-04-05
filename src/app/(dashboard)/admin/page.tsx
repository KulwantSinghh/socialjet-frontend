import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>System overview, user activity, and admin controls will be displayed here.</p>
    </div>
  );
}
