import { NextResponse } from 'next/server';

export async function POST() {
	const response = NextResponse.json(
		{ success: true, message: 'Logged out successfully' },
		{ status: 200 }
	);

	// Remove the token cookie
	response.cookies.set({
		name: 'token',
		value: '',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 0,
		path: '/'
	});

	return response;
}
