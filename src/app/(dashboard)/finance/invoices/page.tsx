import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Invoices' };

export default function InvoicesPage() {
  return (
    <div>
      <h1>Invoices</h1>
      <p>Invoice management and tracking will be displayed here.</p>
    </div>
  );
}
