import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to get user from token
const getUser = async (req) => {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        mentor: true,
      },
    });
  } catch (err) {
    return null;
  }
};

export async function GET(request) {
  try {
    const user = await getUser(request);
    
    if (!user || user.role !== 'MENTOR' || !user.mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: {
        mentorId: user.mentor.id,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching mentor courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
