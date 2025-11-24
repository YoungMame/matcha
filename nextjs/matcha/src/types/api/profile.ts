/**
 * Profile API request/response types
 */

export interface CompleteProfileRequest {
  firstName: string;
  lastName: string;
  bio: string;
  tags: string[];
  gender: 'men' | 'women';
  orientation: 'heterosexual' | 'homosexual' | 'bisexual' | 'other';
  bornAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  tags?: string[];
  gender?: 'men' | 'women';
  orientation?: 'heterosexual' | 'homosexual' | 'bisexual' | 'other';
  bornAt?: string;
}

export interface CompleteProfileResponse {
  message: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  profile?: {
    id: string;
    bio: string;
    tags: string[];
    gender: string;
    orientation: string;
    bornAt: string;
  };
}

export interface UploadProfilePictureResponse {
  success: boolean;
  message?: string;
  url?: string;
}

export interface ProfileError {
  error: string;
  message?: string;
}
