import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileApi } from '@/lib/api/userProfile';

/**
 * React Query hooks for user profile interactions
 */

/**
 * Hook for fetching a user's profile by ID
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userProfileApi.getUserProfile({ userId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Only fetch if userId is provided
  });
}

/**
 * Hook for liking a user's profile
 * Returns match status if mutual like occurs
 */
export function useLikeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userProfileApi.likeProfile({ userId }),
    onSuccess: (data, userId) => {
      // Invalidate the user's profile to update like status
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      // If it's a match, invalidate matches list
      if (data.matched) {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    },
  });
}

/**
 * Hook for unliking a user's profile
 */
export function useUnlikeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userProfileApi.unlikeProfile({ userId }),
    onSuccess: (_data, userId) => {
      // Invalidate the user's profile to update like status
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

/**
 * Hook for blocking a user's profile
 */
export function useBlockProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userProfileApi.blockProfile({ userId }),
    onSuccess: (_data, userId) => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

/**
 * Hook for reporting a user's profile
 */
export function useReportProfile() {
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      userProfileApi.reportProfile({ userId, reason }),
  });
}

/**
 * Hook for recording a profile visit
 */
export function useRecordProfileVisit() {
  return useMutation({
    mutationFn: (userId: string) => userProfileApi.recordVisit({ userId }),
  });
}
