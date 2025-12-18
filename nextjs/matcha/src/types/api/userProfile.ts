/**
 * User Profile API request/response types
 */

export interface GetUserProfileRequest {
  userId: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  profilePictureIndex: number;
  profilePictures: string[];
  bio: string;
  tags: string[];
  bornAt: string;
  gender: string;
  orientation: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    country: string | null;
  };
}

export interface LikeProfileRequest {
  userId: string;
}

export interface LikeProfileResponse {
  success: boolean;
  matched: boolean;
  message?: string;
}

export interface UnlikeProfileRequest {
  userId: string;
}

export interface UnlikeProfileResponse {
  success: boolean;
  message?: string;
}

export interface BlockProfileRequest {
  userId: string;
}

export interface BlockProfileResponse {
  success: boolean;
  message?: string;
}

export interface ReportProfileRequest {
  userId: string;
  reason?: string;
}

export interface ReportProfileResponse {
  success: boolean;
  message?: string;
}

export interface RecordProfileVisitRequest {
  userId: string;
}

export interface RecordProfileVisitResponse {
  success: boolean;
  message?: string;
}

export interface ProfileError {
  error: string;
  message?: string;
}
