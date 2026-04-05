import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <p>Application settings and configuration will be displayed here.</p>
    </div>
  );
}
