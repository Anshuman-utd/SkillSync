import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response that clears the auth token cookie
    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });

    // Expire the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

