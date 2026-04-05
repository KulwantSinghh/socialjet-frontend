import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'User Management' };

export default function UsersPage() {
  return (
    <div>
      <h1>User Management</h1>
      <p>User list, roles, and permissions management will be displayed here.</p>
    </div>
  );
}
