/**
 * Browsing API request/response types
 */

export interface GetProfilesRequest {
  ageMin?: number;
  ageMax?: number;
  locationMin?: number;
  locationMax?: number;
  fameMin?: number;
  fameMax?: number;
  interests?: string[];
  sortBy?: 'age' | 'location' | 'fame' | 'interests' | 'none';
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
}

export interface ProfileResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  age: number;
  birthday: string;
  gender: string;
  orientation: string;
  bio: string;
  interests: string[];
  profilePicture: string | null;
  additionalPictures: string[];
  location: {
    distance?: number;
    city?: string;
  };
  fame: number;
  isOnline: boolean;
  lastSeen?: string;
}

export interface GetProfilesResponse {
  profiles: ProfileResponse[];
  total: number;
  hasMore: boolean;
}

export interface LikeUserRequest {
  userId: string;
}

export interface LikeUserResponse {
  success: boolean;
  matched?: boolean;
  message?: string;
}

export interface PassUserRequest {
  userId: string;
}

export interface PassUserResponse {
  success: boolean;
  message?: string;
}

export interface BrowsingError {
  error: string;
  message?: string;
}
