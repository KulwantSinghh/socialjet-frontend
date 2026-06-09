import type { Metadata } from 'next';
import styles from './page.module.css';
import { UsersTable } from '@/components/shared/UsersTable';

export const metadata: Metadata = {
  title: 'Users | Admin | SocialJet CRM',
};

export default function AdminUsersPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Admin · System</div>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>
          Manage team accounts — filter by role, search, and deactivate users.
        </p>
      </header>
      <UsersTable />
    </div>
  );
}
