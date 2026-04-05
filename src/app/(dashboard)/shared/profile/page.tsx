import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <p>User profile and account settings will be displayed here.</p>
    </div>
  );
}
