/**
 * API Client Layer
 * 
 * This is the central export point for all API modules.
 * Import API functions from here to maintain consistency.
 * 
 * @example
 * import { authApi, userApi } from '@/lib/api';
 */

export { authApi } from './auth';
export { profileApi } from './profile';
export { browsingApi } from './browsing';
export { userProfileApi } from './userProfile';
export { matchesApi } from './matches';

// Add other API modules here as they are created:
// export { chatApi } from './chat';
