import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import type { LoginRequest, SignupRequest } from '@/types/api/auth';

/**
 * React Query hooks for authentication
 */

/**
 * Hook for logging in a user
 * Automatically redirects to /browsing on success
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/browsing');
    },
  });
}

/**
 * Hook for signing up a new user
 * Returns mutation object with success state
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: () => {
      // Invalidate queries on successful signup
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook for logging out the current user
 * Redirects to home page on success
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await authApi.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      router.push('/');
    },
  });
}

/**
 * Hook for fetching current user data
 * Returns user info if authenticated
 */
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if not authenticated
  });
}
