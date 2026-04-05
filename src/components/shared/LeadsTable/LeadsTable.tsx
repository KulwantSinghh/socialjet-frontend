import styles from './LeadsTable.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Lead {
  id: string;
  name: string;
  company: string;
  source: string;
  status: string;
  value: string;
  contact: string;
  date: string;
  statusColor: string;
}

const LEADS: Lead[] = [
  {
    id: '1',
    name: 'Velo Coffee Roasters',
    company: 'Lead: Marcus Aurelius',
    source: 'Whatsapp',
    status: 'Proposal Sent',
    value: '$12,500',
    contact: 'Priya Sharma',
    date: 'Apr 15, 2021',
    statusColor: '#00BA88',
  },
  {
    id: '2',
    name: 'Velo Coffee Roasters',
    company: 'Lead: Marcus Aurelius',
    source: 'Whatsapp',
    status: 'New',
    value: '$12,500',
    contact: 'Priya Sharma',
    date: 'Apr 15, 2021',
    statusColor: '#6C63FF',
  },
  {
    id: '3',
    name: 'Velo Coffee Roasters',
    company: 'Lead: Marcus Aurelius',
    source: 'Whatsapp',
    status: 'New',
    value: '$12,500',
    contact: 'Priya Sharma',
    date: 'Apr 15, 2021',
    statusColor: '#6C63FF',
  },
  {
    id: '4',
    name: 'Velo Coffee Roasters',
    company: 'Contact: Marcus Aurelius',
    source: 'Whatsapp',
    status: 'Proposal Sent',
    value: '$12,500',
    contact: 'Priya Sharma',
    date: 'Apr 15, 2021',
    statusColor: '#00BA88',
  },
];

export const LeadsTable = () => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.icon}>📋</span>
          <h3 className={styles.title}>All Leads</h3>
        </div>
        <div className={styles.actions}>
          <Input placeholder="Search" className={styles.search} leftIcon={<span>🔍</span>} />
          <Button className={styles.newLeadBtn}>New Lead</Button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead name</th>
              <th>Source</th>
              <th>Status</th>
              <th>Deal value</th>
              <th>Contact</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {LEADS.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className={styles.leadCell}>
                    <div className={styles.leadLogo}>🏘️</div>
                    <div className={styles.leadInfo}>
                      <span className={styles.leadName}>{lead.name}</span>
                      <span className={styles.leadCompany}>{lead.company}</span>
                    </div>
                  </div>
                </td>
                <td>{lead.source}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{
                      color: lead.statusColor,
                      backgroundColor: `${lead.statusColor}15`,
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td>{lead.value}</td>
                <td>{lead.contact}</td>
                <td>{lead.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
