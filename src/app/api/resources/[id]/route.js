import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../src/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
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

export async function DELETE(request, { params }) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== 'MENTOR' || !user.mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const resourceId = parseInt(id);

    // Verify resource exists and belongs to a course owned by the mentor
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        course: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (resource.course.mentorId !== user.mentor.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this resource' }, { status: 403 });
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
