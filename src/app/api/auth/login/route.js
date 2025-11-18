import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT
    const token = generateToken({ userId: user.id, email: user.email });

    // Create response
    const response = NextResponse.json(
      { message: 'Login successful', user },
      { status: 200 }
    );

    // FIX: Set the login cookie
    return NextResponse.json(
      { message: 'Login successful', token },
      { status: 200 }
    );
    

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
