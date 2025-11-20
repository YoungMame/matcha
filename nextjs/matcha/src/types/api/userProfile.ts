/**
 * User Profile API request/response types
 */

export interface GetUserProfileRequest {
  userId: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
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
  isLikedByMe?: boolean;
  isLikedByThem?: boolean;
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
