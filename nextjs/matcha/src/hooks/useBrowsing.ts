import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
  const [isLiking, setIsLiking] = useState(false);

  const likeUser = async (userId: string) => {
    setIsLiking(true);
    try {
      const data = await browsingApi.likeUser({ userId });
      
      // Invalidate profiles to update UI
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      // If it's a match, invalidate matches list
      if (data.matched) {
        await queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
      return data;
    } finally {
      setIsLiking(false);
    }
  };

  return { likeUser, isLiking };
}

/**
 * Hook for passing on a user
 */
export function usePassUser() {
  const queryClient = useQueryClient();
  const [isPassing, setIsPassing] = useState(false);

  const passUser = async (userId: string) => {
    setIsPassing(true);
    try {
      await browsingApi.passUser({ userId });
      // Invalidate profiles to update UI
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
    } finally {
      setIsPassing(false);
    }
  };

  return { passUser, isPassing };
}

