import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';

/**
 * React Query hooks for profile management
 */

/**
 * Hook for fetching current user's profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
