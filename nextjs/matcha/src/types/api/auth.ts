/**
 * Auth API request/response types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  bornAt: string;
  orientation: 'men' | 'women' | 'bisexual';
  gender: 'men' | 'women';
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface AuthError {
  error: string;
}
