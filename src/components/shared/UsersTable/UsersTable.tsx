'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import styles from './UsersTable.module.css';
import { Input } from '@/components/ui/Input';
import { DeleteUserModal } from '@/components/shared/DeleteUserModal';
import { AddMemberModal } from '@/components/shared/AddMemberModal';
import { useAdminUsers, useDeleteUser, ADMIN_USERS_QUERY_KEY } from '@/hooks/useAdminUsers';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/roles.types';
import type { AdminUser } from '@/types/admin.types';

// ---- config ----

const PAGE_SIZE = 20;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.Admin, label: 'Admin' },
  { value: UserRole.Sales, label: 'Sales' },
  { value: UserRole.CampaignManager, label: 'Campaign Manager' },
  { value: UserRole.CampaignManagerLead, label: 'Campaign Manager Lead' },
  { value: UserRole.Finance, label: 'Finance' },
  { value: UserRole.Client, label: 'Client' },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((o) => [o.value, o.label])
);

/** Per-role badge colors (text + tinted background derived at render time). */
const ROLE_COLORS: Record<string, string> = {
  [UserRole.Admin]: '#6C63FF',
  [UserRole.Sales]: '#00BA88',
  [UserRole.CampaignManager]: '#F7A83B',
  [UserRole.CampaignManagerLead]: '#E0820A',
  [UserRole.Finance]: '#3B82F6',
  [UserRole.Client]: '#8E95A2',
};

// ---- helpers ----

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(username: string): string {
  return username.replace(/[_-]/g, ' ').trim().slice(0, 2).toUpperCase() || '?';
}

function extractError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    return first?.msg ?? fallback;
  }
  return fallback;
}

// ---- skeleton ----

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className={styles.skeletonRow}>
          <td>
            <div className={styles.skeletonUser}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonCell} style={{ width: '120px' }} />
                <div className={styles.skeletonCell} style={{ width: '160px', height: '10px' }} />
              </div>
            </div>
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '80px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '70px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '130px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '130px' }} />
          </td>
          <td>
            <div className={styles.skeletonCell} style={{ width: '32px' }} />
          </td>
        </tr>
      ))}
    </>
  );
}

// ---- row ----

interface UserRowProps {
  user: AdminUser;
  isSelf: boolean;
  onDelete: (user: AdminUser) => void;
}

function UserRow({ user, isSelf, onDelete }: UserRowProps) {
  const isDeleted = Boolean(user.deleted_at);
  const roleColor = ROLE_COLORS[user.role] ?? '#8E95A2';
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <tr className={isDeleted ? styles.deletedRow : undefined}>
      <td>
        <div className={styles.userCell}>
          <div
            className={styles.avatar}
            style={{ backgroundColor: `${roleColor}1A`, color: roleColor }}
          >
            {initials(user.username)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.username}>{user.username}</span>
            <span className={styles.email}>{user.email || '— no email —'}</span>
          </div>
        </div>
      </td>
      <td>
        <span
          className={styles.roleBadge}
          style={{ color: roleColor, backgroundColor: `${roleColor}15` }}
        >
          {roleLabel}
        </span>
      </td>
      <td>
        {isDeleted ? (
          <span className={`${styles.statusBadge} ${styles.statusDeleted}`}>Deactivated</span>
        ) : (
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>Active</span>
        )}
      </td>
      <td className={styles.dateCell}>{formatDateTime(user.created_at)}</td>
      <td className={styles.dateCell}>
        {isDeleted ? formatDateTime(user.deleted_at) : formatDateTime(user.updated_at)}
      </td>
      <td>
        <button
          type="button"
          className={styles.deleteIconBtn}
          onClick={() => onDelete(user)}
          disabled={isDeleted || isSelf}
          title={
            isSelf
              ? 'You cannot deactivate your own account'
              : isDeleted
                ? 'Account already deactivated'
                : 'Deactivate user'
          }
          aria-label={`Deactivate ${user.username}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ---- main component ----

export const UsersTable = () => {
  const currentUsername = useAuthStore((s) => s.username);
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const deleteUser = useDeleteUser();

  // 400ms debounce on search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to first page whenever filters change
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setPage(1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [debouncedSearch, roleFilter, includeDeleted]);

  const params = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(includeDeleted ? { include_deleted: true } : {}),
    }),
    [page, debouncedSearch, roleFilter, includeDeleted]
  );

  const { data, isLoading, isFetching, isError, refetch } = useAdminUsers(params);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const hasFilters = Boolean(debouncedSearch || roleFilter || includeDeleted);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser.mutate(userToDelete.user_id, {
      onSuccess: (res) => {
        toast.success(res.message || `${userToDelete.username} has been deactivated.`);
        setUserToDelete(null);
      },
      onError: (err) => {
        toast.error(extractError(err, 'Failed to deactivate user. Please try again.'));
      },
    });
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.headerIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h3 className={styles.title}>All Users</h3>
            <p className={styles.subtitle}>
              {isLoading ? 'Loading…' : `${total} user${total === 1 ? '' : 's'} total`}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Input
            placeholder="Search username or email"
            className={styles.search}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            <span className={styles.toggleTrack} aria-hidden>
              <span className={styles.toggleThumb} />
            </span>
            <span className={styles.toggleLabel}>Show deactivated</span>
          </label>

          <button
            type="button"
            className={styles.addMemberBtn}
            onClick={() => setIsAddOpen(true)}
            id="add-member-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 8v6M22 11h-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Member
          </button>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows />}

            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <p>Couldn’t load users.</p>
                  <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
                    Try again
                  </button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && users.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {hasFilters ? 'No users match your filters' : 'No users yet'}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              users.map((user) => (
                <UserRow
                  key={user.user_id}
                  user={user}
                  isSelf={Boolean(currentUsername) && user.username === currentUsername}
                  onDelete={setUserToDelete}
                />
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && total > 0 && (
        <footer className={styles.footer}>
          <span className={styles.rangeInfo}>
            Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of{' '}
            <strong>{total}</strong>
            {isFetching ? <span className={styles.inlineSpinner} /> : null}
          </span>
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.pagerBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              ‹ Prev
            </button>
            <span className={styles.pageLabel}>
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              className={styles.pagerBtn}
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next ›
            </button>
          </div>
        </footer>
      )}

      <DeleteUserModal
        open={Boolean(userToDelete)}
        user={userToDelete}
        isDeleting={deleteUser.isPending}
        onClose={() => {
          if (!deleteUser.isPending) setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <AddMemberModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          void queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
        }}
      />
    </div>
  );
};
