import axios from '@/lib/axios';
import type {
  GetProfilesRequest,
  GetProfilesResponse,
  LikeUserRequest,
  LikeUserResponse,
  PassUserRequest,
  PassUserResponse,
} from '@/types/api/browsing';

/**
 * Browsing API endpoints
 * All functions use the configured axios instance with credentials
 */

export const browsingApi = {
  /**
   * Get profiles based on search/filter criteria
   */
  getProfiles: async (params: GetProfilesRequest = {}): Promise<GetProfilesResponse> => {
    const response = await axios.get<GetProfilesResponse>('/api/private/browsing/profiles', {
      params,
    });
    return response.data;
  },

  /**
   * Like a user (quick action from browsing)
   */
  likeUser: async (data: LikeUserRequest): Promise<LikeUserResponse> => {
    const response = await axios.post<LikeUserResponse>('/api/private/like', data);
    return response.data;
  },

  /**
   * Pass on a user
   */
  passUser: async (data: PassUserRequest): Promise<PassUserResponse> => {
    const response = await axios.post<PassUserResponse>('/api/private/pass', data);
    return response.data;
  },

  /**
   * Get available interests/tags
   */
  getAvailableInterests: async (): Promise<string[]> => {
    const response = await axios.get<{ interests: string[] }>('/api/private/browsing/interests');
    return response.data.interests;
  },
};
