'use client';

import styles from './OnboardingTable.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface OnboardingLead {
  id: string;
  name: string;
  contact: string;
  product: string;
  invoice: 'Checked' | 'Pending';
  agenda: 'Checked' | 'Pending';
  callDone: 'Checked' | 'Pending';
  content: 'Checked' | 'Pending';
}

const ONBOARDING_LEADS: OnboardingLead[] = [
  {
    id: '1',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '2',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Pending',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '3',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '4',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Pending',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '5',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '6',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '7',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '8',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
  {
    id: '9',
    name: 'Velo Coffee Roasters',
    contact: 'Contact: Marcus Aurelius',
    product: 'Vitamin c serum',
    invoice: 'Checked',
    agenda: 'Checked',
    callDone: 'Checked',
    content: 'Checked',
  },
];

const StatusBadge = ({ status }: { status: 'Checked' | 'Pending' }) => {
  return (
    <span
      className={cn(styles.statusBadge, status === 'Checked' ? styles.checked : styles.pending)}
    >
      {status}
    </span>
  );
};

export const OnboardingTable = () => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBox}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </div>
          <h3 className={styles.title}>All Leads</h3>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="Search"
              className={styles.search}
              leftIcon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-brand-purple)"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>
          <Button variant="outline" size="sm" className={styles.filterBtn}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filter
          </Button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead name</th>
              <th>Product</th>
              <th>Invoice</th>
              <th>agenda</th>
              <th>call done</th>
              <th>content</th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING_LEADS.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className={styles.leadCell}>
                    <div className={styles.leadIconBox}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-brand-purple)"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className={styles.leadInfo}>
                      <span className={styles.leadName}>{lead.name}</span>
                      <span className={styles.leadContact}>{lead.contact}</span>
                    </div>
                  </div>
                </td>
                <td>{lead.product}</td>
                <td>
                  <StatusBadge status={lead.invoice} />
                </td>
                <td>
                  <StatusBadge status={lead.agenda} />
                </td>
                <td>
                  <StatusBadge status={lead.callDone} />
                </td>
                <td>
                  <StatusBadge status={lead.content} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
