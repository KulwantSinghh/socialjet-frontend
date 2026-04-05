import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Billing' };

export default function BillingPage() {
  return (
    <div>
      <h1>Billing</h1>
      <p>Billing management will be displayed here.</p>
    </div>
  );
}
