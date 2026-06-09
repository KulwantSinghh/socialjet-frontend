'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import type { AdminUsersListParams } from '@/types/admin.types';

export const ADMIN_USERS_QUERY_KEY = 'admin-users';

export function useAdminUsers(params?: AdminUsersListParams) {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => adminService.listUsers(params),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
}
