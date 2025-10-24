// JWT utility functions for authentication

export interface DecodedToken {
	userId: string;
	username: string;
	exp: number;
}

/**
 * Simple JWT decoder (for demo purposes - in production use a proper JWT library)
 */
export function decodeJWT(token: string): DecodedToken | null {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Failed to decode JWT:', error);
		return null;
	}
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
	const decoded = decodeJWT(token);
	if (!decoded) return true;

	const currentTime = Math.floor(Date.now() / 1000);
	return decoded.exp < currentTime;
}

/**
 * Get token from cookies (client-side)
 */
export function getToken(): string | null {
	if (typeof window === 'undefined') return null;

	const cookies = document.cookie.split(';');
	const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

	if (!tokenCookie) return null;

	return tokenCookie.split('=')[1];
}

/**
 * Set token in cookies (client-side)
 */
export function setToken(token: string, expiresInDays: number = 7): void {
	if (typeof window === 'undefined') return;

	const expires = new Date();
	expires.setDate(expires.getDate() + expiresInDays);

	document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Remove token from cookies (client-side)
 */
export function removeToken(): void {
	if (typeof window === 'undefined') return;

	document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
	const token = getToken();
	if (!token) return false;

	return !isTokenExpired(token);
}
