import axios from '@/lib/axios';
import { generateMockProfilesWithMetadata } from '@/mocks/browsing_mocks';
import { calculateAge } from '@/lib/searchUtils';
import type {
  GetProfilesRequest,
  GetProfilesResponse,
  LikeUserRequest,
  LikeUserResponse,
  PassUserRequest,
  PassUserResponse,
  ProfileResponse,
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
    // Mock implementation
    const mockProfiles = generateMockProfilesWithMetadata(undefined, 20);
    
    const profiles: ProfileResponse[] = mockProfiles.map(p => ({
      id: p.id,
      username: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}`,
      firstName: p.firstName,
      lastName: p.lastName,
      age: calculateAge(p.birthday),
      birthday: p.birthday,
      gender: p.gender,
      orientation: p.interestedInGenders.join(','),
      bio: p.biography,
      interests: p.interests,
      profilePicture: p.profilePicture,
      additionalPictures: p.additionalPictures.filter((pic): pic is string => pic !== null),
      location: {
        distance: p.distance,
        city: 'Paris',
      },
      fame: p.fame,
      isOnline: Math.random() > 0.5,
      lastSeen: new Date().toISOString(),
    }));

    return {
      profiles,
      total: profiles.length,
      hasMore: false
    };
  },

  /**
   * Like a user (quick action from browsing)
   */
  likeUser: async (data: LikeUserRequest): Promise<LikeUserResponse> => {
    const response = await axios.post<LikeUserResponse>(`/api/private/user/like/${data.userId}`);
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
