import axios from '@/lib/axios';
import type { CompleteProfileRequest, CompleteProfileResponse, UpdateProfileRequest, UpdateProfileResponse, UploadProfilePictureResponse } from '@/types/api/profile';

/**
 * Profile API endpoints
 * All functions use the configured axios instance with credentials
 */

export const profileApi = {
  /**
   * Complete user profile (onboarding)
   * Required fields: firstName, lastName, bio, tags, gender, orientation, bornAt
   */
  completeProfile: async (data: CompleteProfileRequest): Promise<CompleteProfileResponse> => {
    const response = await axios.post<CompleteProfileResponse>('/api/private/user/me/complete-profile', data);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await axios.put<UpdateProfileResponse>('/api/private/user/me/profile', data);
    return response.data;
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File): Promise<UploadProfilePictureResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post<UploadProfilePictureResponse>(
      '/api/private/user/me/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete profile picture
   */
  deleteProfilePicture: async (index: number): Promise<void> => {
    await axios.delete(`/api/private/user/me/profile-picture/${index}`);
  },

  /**
   * Set profile picture as main (index)
   */
  setProfilePictureIndex: async (index: number): Promise<void> => {
    await axios.put(`/api/private/user/me/profile-picture/${index}`);
  },

  /**
   * Get current user profile
   */
  getMyProfile: async (): Promise<any> => {
    const response = await axios.get('/api/private/user/me/profile');
	console.log('getMyProfile response:', response.data);
    return response.data;
  },
};
