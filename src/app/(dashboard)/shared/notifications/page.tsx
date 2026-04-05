import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div>
      <h1>Notifications</h1>
      <p>Notification center will be displayed here.</p>
    </div>
  );
}
