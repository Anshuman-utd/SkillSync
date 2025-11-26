import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const normalizedRole = (role === 'MENTOR' || role === 'STUDENT') ? role : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: normalizedRole,
      },
    });

    // Create role-specific profile
    if (normalizedRole === 'STUDENT') {
      await prisma.student.create({
        data: { userId: user.id }
      });
    } else if (normalizedRole === 'MENTOR') {
      await prisma.mentor.create({
        data: { userId: user.id }
      });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Create response
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user,
        token,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}