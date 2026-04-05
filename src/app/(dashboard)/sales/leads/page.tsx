import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Leads' };

export default function LeadsPage() {
  return (
    <div>
      <h1>Leads</h1>
      <p>Lead management table and actions will be displayed here.</p>
    </div>
  );
}
