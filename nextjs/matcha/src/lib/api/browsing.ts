import axios from '@/lib/axios';
import { generateMockProfilesWithMetadata } from '@/mocks/browsing_mocks';
import { calculateAge } from '@/lib/searchUtils';
import { profileApi } from '@/lib/api/profile';
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
    let userProfile;
    try {
      userProfile = await profileApi.getMyProfile();
    } catch (error) {
      console.error('Failed to fetch user profile for defaults', error);
    }

    /* Mock implementation
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
    */

    const {
      ageMin = 18,
      ageMax = 100,
      fameMin = 0,
      fameMax = 1000,
      locationMax = 100,
      sortBy = 'default',
    } = params;

	const interests = params.interests ? params.interests.length > 0 ? params.interests :  userProfile?.tags ?? [] : userProfile?.tags ?? [];
	const lat = userProfile?.location?.latitude || 48.8566;
	const lng = userProfile?.location?.longitude || 2.3522;

    const tagsParam = interests.length > 0 ? interests.join(',') : 'null';
    
    const sortByMap: Record<string, string> = {
      'age': 'age',
      'location': 'distance',
      'fame': 'fameRate',
      'interests': 'tags',
      'none': 'default',
      'default': 'default'
    };
    const mappedSortBy = sortByMap[sortBy] || 'default';

    // Backend route: /:minAge/:maxAge/:minFame/:maxFame/:tags/:lat/:lng/:radius/:sortBy
    const url = `/api/private/browsing/${ageMin}/${ageMax}/${fameMin}/${fameMax}/${tagsParam}/${lat}/${lng}/${locationMax}/${mappedSortBy}`;

    const response = await axios.get<{ users: any[] }>(url);
    
    const profiles: ProfileResponse[] = response.data.users.map((u: any) => ({
      id: u.id.toString(),
      username: u.firstName.toLowerCase(), // Fallback
      firstName: u.firstName,
      lastName: '', // Missing
      age: calculateAge(u.bornAt),
      birthday: u.bornAt,
      gender: u.gender,
      orientation: '', // Missing
      bio: '', // Missing
      interests: u.tags,
      profilePicture: u.profilePicture,
      additionalPictures: [], // Missing
      location: {
        distance: u.distance,
        city: 'Unknown', // Missing
      },
      fame: u.fameRate,
      isOnline: false, // Missing
      lastSeen: undefined, // Missing
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
};
