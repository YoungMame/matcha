import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { browsingApi } from '@/lib/api/browsing';
import type { GetProfilesRequest } from '@/types/api/browsing';

/**
 * React Query hooks for browsing functionality
 */

/**
 * Hook for fetching profiles with filters
 * Automatically caches and refetches based on filter changes
 */
export function useProfiles(filters: GetProfilesRequest = {}) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => browsingApi.getProfiles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for liking a user
 * Returns match status if a mutual like occurs
 */
export function useLikeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => browsingApi.likeUser({ userId }),
    onSuccess: (data) => {
      // Invalidate profiles to update UI
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      // If it's a match, invalidate matches list
      if (data.matched) {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
  });
}

/**
 * Hook for passing on a user
 */
export function usePassUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => browsingApi.passUser({ userId }),
    onSuccess: () => {
      // Invalidate profiles to update UI
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

/**
 * Hook for fetching available interests/tags
 */
export function useAvailableInterests() {
  return useQuery({
    queryKey: ['interests'],
    queryFn: () => browsingApi.getAvailableInterests(),
    staleTime: 60 * 60 * 1000, // 1 hour - interests don't change often
  });
}
