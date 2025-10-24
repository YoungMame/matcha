import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple JWT decoder for middleware
 */
function decodeJWT(token: string): any {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
		return JSON.parse(jsonPayload);
	} catch (error) {
		return null;
	}
}

/**
 * Check if token is expired
 */
function isTokenExpired(decoded: any): boolean {
	if (!decoded || !decoded.exp) return true;
	const currentTime = Math.floor(Date.now() / 1000);
	return decoded.exp < currentTime;
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Get token from cookies
	const token = request.cookies.get('token')?.value;

	// Protected routes that require authentication
	const protectedPaths = ['/dashboard'];
	const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

	// Public routes that should redirect to dashboard if already logged in
	const authPaths = ['/login'];
	const isAuthPath = authPaths.some(path => pathname.startsWith(path));

	// Check authentication
	let isAuthenticated = false;
	if (token) {
		const decoded = decodeJWT(token);
		isAuthenticated = decoded && !isTokenExpired(decoded);
	}

	// Redirect logic
	if (isProtectedPath && !isAuthenticated) {
		// Redirect to login if trying to access protected route without authentication
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		return NextResponse.redirect(url);
	}

	if (isAuthPath && isAuthenticated) {
		// Redirect to dashboard if already logged in and trying to access login
		const url = request.nextUrl.clone();
		url.pathname = '/dashboard';
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
