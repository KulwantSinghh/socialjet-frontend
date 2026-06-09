import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type {
  AdminUsersListParams,
  AdminUsersListResponse,
  DeleteUserResponse,
} from '@/types/admin.types';

export const adminService = {
  /** Retrieve all users with optional filtering, search, and pagination. */
  listUsers: async (params?: AdminUsersListParams): Promise<AdminUsersListResponse> => {
    const { data } = await apiClient.get(ENDPOINTS.ADMIN.USERS, { params });
    return data;
  },

  /** Soft-delete (deactivate) a user account by id. */
  deleteUser: async (userId: string): Promise<DeleteUserResponse> => {
    const { data } = await apiClient.delete(ENDPOINTS.ADMIN.USER_DELETE(userId));
    return data;
  },
};
