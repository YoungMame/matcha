import axios from '@/lib/axios';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/api/auth';

/**
 * Auth API endpoints
 * All functions use the configured axios instance with credentials
 */

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },

  /**
   * Register a new user
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await axios.post<SignupResponse>('/api/auth/signup', data);
    return response.data;
  },

  /**
   * Logout current user by clearing the JWT cookie
   */
  logout: async (): Promise<void> => {
    const domain = window.location.hostname;
    const cookieOptions = `path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `jwt=; ${cookieOptions}`;
  },

  /**
   * Get current user information
   */
  me: async (): Promise<any> => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },
};
