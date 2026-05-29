import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultRouteForRole } from '@/lib/roleConfig';
import { UserRole } from '@/types/roles.types';
import type {
  LoginRequest,
  AuthResponse,
  CreateUserRequest,
  CreateUserResponse,
} from '@/types/auth.types';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: async (data, variables) => {
      setAuth(data.role, data.access_token, data.refresh_token, variables.username);
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch {
        // non-fatal — name display degrades gracefully
      }
      const targetPath = getDefaultRouteForRole(data.role as UserRole) || '/sales';
      router.push(targetPath);
    },
  });
}

export function useCreateUser() {
  return useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: (payload: CreateUserRequest) => authService.createUser(payload),
  });
}
