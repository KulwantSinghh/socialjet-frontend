import type { UserRole } from './roles.types';

/** A single user record returned by the admin user-management endpoints. */
export interface AdminUser {
  user_id: string;
  username: string;
  /** Omitted by the API if the user has no email set. */
  email?: string;
  role: UserRole;
  created_at: string;
  /** Omitted if the account has never been updated. */
  updated_at?: string;
  /** Only present on soft-deleted accounts. */
  deleted_at?: string;
}

/** Query parameters accepted by `GET /admin/users`. */
export interface AdminUsersListParams {
  role?: UserRole;
  search?: string;
  include_deleted?: boolean;
  page?: number;
  page_size?: number;
}

/** Paginated response from `GET /admin/users`. */
export interface AdminUsersListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Response from `DELETE /admin/users/{user_id}`. */
export interface DeleteUserResponse {
  message: string;
  deleted_at: string;
}
