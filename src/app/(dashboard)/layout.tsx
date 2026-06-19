import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AlertNotifier } from '@/components/notifications/AlertNotifier';
import { Toaster } from 'sonner';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.root}>
      <Sidebar />

      <div className={styles.main}>
        <Topbar />

        <main className={styles.content}>{children}</main>
      </div>

      <AlertNotifier />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
