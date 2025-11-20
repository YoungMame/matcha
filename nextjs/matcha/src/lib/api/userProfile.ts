import axios from '@/lib/axios';
import type {
  GetUserProfileRequest,
  UserProfileResponse,
  LikeProfileRequest,
  LikeProfileResponse,
  UnlikeProfileRequest,
  UnlikeProfileResponse,
  BlockProfileRequest,
  BlockProfileResponse,
  ReportProfileRequest,
  ReportProfileResponse,
  RecordProfileVisitRequest,
  RecordProfileVisitResponse,
} from '@/types/api/userProfile';

/**
 * User Profile API endpoints
 * All functions use the configured axios instance with credentials
 */

export const userProfileApi = {
  /**
   * Get a user's profile by ID
   */
  getUserProfile: async ({ userId }: GetUserProfileRequest): Promise<UserProfileResponse> => {
    const response = await axios.get<UserProfileResponse>(`/api/private/user/${userId}/profile`);
    return response.data;
  },

  /**
   * Like a user's profile
   */
  likeProfile: async ({ userId }: LikeProfileRequest): Promise<LikeProfileResponse> => {
    const response = await axios.post<LikeProfileResponse>('/api/private/like', { userId });
    return response.data;
  },

  /**
   * Unlike a user's profile
   */
  unlikeProfile: async ({ userId }: UnlikeProfileRequest): Promise<UnlikeProfileResponse> => {
    const response = await axios.delete<UnlikeProfileResponse>(`/api/private/like/${userId}`);
    return response.data;
  },

  /**
   * Block a user
   */
  blockProfile: async ({ userId }: BlockProfileRequest): Promise<BlockProfileResponse> => {
    const response = await axios.post<BlockProfileResponse>('/api/private/block', { userId });
    return response.data;
  },

  /**
   * Report a user's profile
   */
  reportProfile: async ({ userId, reason }: ReportProfileRequest): Promise<ReportProfileResponse> => {
    const response = await axios.post<ReportProfileResponse>('/api/private/report', { userId, reason });
    return response.data;
  },

  /**
   * Record a profile visit/view
   */
  recordVisit: async ({ userId }: RecordProfileVisitRequest): Promise<RecordProfileVisitResponse> => {
    const response = await axios.post<RecordProfileVisitResponse>('/api/private/view', { userId });
    return response.data;
  },
};
