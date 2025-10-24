import { NextRequest, NextResponse } from 'next/server';

// Mock user database
const MOCK_USERS = [
	{ id: '1', username: 'admin', password: 'admin123' },
	{ id: '2', username: 'user', password: 'user123' },
];

/**
 * Mock JWT token generator
 * In production, use a proper JWT library like jsonwebtoken
 */
function generateMockJWT(userId: string, username: string): string {
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const payload = {
		userId,
		username,
		exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
		iat: Math.floor(Date.now() / 1000)
	};

	// Mock encoding (NOT secure for production!)
	const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = Buffer.from('mock-signature').toString('base64url');

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { username, password } = body;

		// Validate input
		if (!username || !password) {
			return NextResponse.json(
				{ error: 'Username and password are required' },
				{ status: 400 }
			);
		}

		// Simulate network delay
		await new Promise(resolve => setTimeout(resolve, 500));

		// Find user
		const user = MOCK_USERS.find(
			u => u.username === username && u.password === password
		);

		if (!user) {
			return NextResponse.json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			);
		}

		// Generate token
		const token = generateMockJWT(user.id, user.username);

		// Create response with token in cookie
		const response = NextResponse.json(
			{
				success: true,
				user: {
					id: user.id,
					username: user.username
				},
				token
			},
			{ status: 200 }
		);

		// Set HTTP-only cookie (more secure)
		response.cookies.set({
			name: 'token',
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/'
		});

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
