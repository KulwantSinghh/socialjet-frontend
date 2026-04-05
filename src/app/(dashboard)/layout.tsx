import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.root}>
      {/* Sidebar now uses the shared layout component */}
      <Sidebar />

      <div className={styles.main}>
        {/* Topbar now uses the shared layout component */}
        <Topbar />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
