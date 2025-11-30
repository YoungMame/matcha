import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (data: LoginRequest) => {
    setIsPending(true);
    setError(null);
    
    try {
      await authApi.login(data);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/browsing');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, error };
}

/**
 * Hook for signing up a new user
 */
export function useSignup() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signup = async (data: SignupRequest) => {
    setIsPending(true);
    setError(null);
    
    try {
      await authApi.signup(data);
      // Invalidate queries on successful signup
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { signup, isPending, error };
}

/**
 * Hook for logging out the current user
 * Redirects to home page on success
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const logout = async () => {
    setIsPending(true);
    setError(null);
    
    try {
      await authApi.logout();
      // Clear all cached data
      queryClient.clear();
      router.push('/');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { logout, isPending, error };
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
