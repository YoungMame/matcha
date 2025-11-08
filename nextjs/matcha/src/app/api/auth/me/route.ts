import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Simple JWT decoder for server-side
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

export async function GET(request: NextRequest) {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 }
		);
	}

	const decoded = decodeJWT(token);

	if (!decoded) {
		return NextResponse.json(
			{ error: 'Invalid token' },
			{ status: 401 }
		);
	}

	// Check if token is expired
	const currentTime = Math.floor(Date.now() / 1000);
	if (decoded.exp < currentTime) {
		return NextResponse.json(
			{ error: 'Token expired' },
			{ status: 401 }
		);
	}

	return NextResponse.json({
		user: {
			id: decoded.userId,
			username: decoded.username
		}
	});
}
