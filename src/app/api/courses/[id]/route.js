import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/courses/[id]
export async function GET(_request, { params }) {
  try {
    const id = Number(params.id);
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mentor: { include: { user: true } },
        categories: { include: { category: true } },
      },
    });
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/courses/[id] - mentor owner only
export async function PATCH(request, { params }) {
  try {
    const id = Number(params.id);
    const token = request.cookies.get('token')?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const mentor = await prisma.mentor.findUnique({ where: { userId: decoded.userId } });
    if (!mentor) return NextResponse.json({ error: 'Only mentors can update courses' }, { status: 403 });

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing || existing.mentorId !== mentor.id) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, imageUrl, level, durationWeeks, rating, categories } = body;

    // Update base fields
    const updated = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        level,
        durationWeeks,
        rating,
      },
    });

    // Replace categories if provided
    if (Array.isArray(categories)) {
      // Clear existing
      await prisma.courseCategory.deleteMany({ where: { courseId: id } });
      const createManyData = [];
      for (const nameOrSlug of categories) {
        const slug = nameOrSlug.toLowerCase().replace(/\s+/g, '-');
        let cat = await prisma.category.findFirst({ where: { OR: [{ slug }, { name: nameOrSlug }] } });
        if (!cat) cat = await prisma.category.create({ data: { name: nameOrSlug, slug } });
        createManyData.push({ courseId: id, categoryId: cat.id });
      }
      if (createManyData.length) {
        await prisma.courseCategory.createMany({ data: createManyData });
      }
    }

    return NextResponse.json({ course: updated });
  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - mentor owner only
export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id);
    const token = request.cookies.get('token')?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const mentor = await prisma.mentor.findUnique({ where: { userId: decoded.userId } });
    if (!mentor) return NextResponse.json({ error: 'Only mentors can delete courses' }, { status: 403 });

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing || existing.mentorId !== mentor.id) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    await prisma.courseCategory.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

