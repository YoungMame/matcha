import { useQuery } from '@tanstack/react-query';
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
