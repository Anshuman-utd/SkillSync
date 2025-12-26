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
        student: true,
      },
    });
  } catch (err) {
    return null;
  }
};

export async function POST(request) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== 'MENTOR' || !user.mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, fileUrl, courseId } = body;

    if (!title || !fileUrl || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify course belongs to mentor
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course || course.mentorId !== user.mentor.id) {
       return NextResponse.json({ error: 'Unauthorized to add resources to this course' }, { status: 403 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        fileUrl,
        courseId: parseInt(courseId),
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resources = [];

    if (user.role === 'MENTOR' && user.mentor) {
      // Fetch resources for all courses taught by this mentor
      resources = await prisma.resource.findMany({
        where: {
          course: {
            mentorId: user.mentor.id,
          },
        },
        include: {
          course: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'STUDENT' && user.student) {
      // Fetch resources for courses the student is enrolled in
      resources = await prisma.resource.findMany({
        where: {
          course: {
            enrollments: {
              some: {
                studentId: user.student.id,
              },
            },
          },
        },
         include: {
          course: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(resources);
  } catch (error) {
     console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
