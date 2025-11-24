import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import type { CompleteProfileRequest, UpdateProfileRequest } from '@/types/api/profile';

/**
 * React Query hooks for profile management
 */

/**
 * Hook for completing user profile during onboarding
 * Required to finish user registration
 */
export function useCompleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) => profileApi.completeProfile(data),
    onSuccess: () => {
      // Invalidate all queries to refetch with completed profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook for updating user profile
 * Used for profile editing after onboarding
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook for uploading profile picture
 * Handles multipart/form-data upload
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: () => {
      // Invalidate profile queries to show new picture
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook for deleting profile picture
 */
export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (index: number) => profileApi.deleteProfilePicture(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook for setting main profile picture
 */
export function useSetProfilePictureIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (index: number) => profileApi.setProfilePictureIndex(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

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
