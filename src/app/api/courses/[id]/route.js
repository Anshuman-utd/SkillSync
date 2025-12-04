import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/courses/[id]
export async function GET(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const token = request.cookies.get('token')?.value;
    let userId = null;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            const user = await prisma.user.findUnique({ where: { email: decoded.email } });
            userId = user?.id;
        }
    }

    // Fetch the course with correct includes
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
        category: true,
        enrollments: true, // for studentCount
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check enrollment status
    let isEnrolled = false;
    if (userId) {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (student) {
            // Check if student ID exists in the course's enrollments list
            isEnrolled = course.enrollments.some(e => e.studentId === student.id);
        }
    }

    // Compute student count
    const studentCount = course.enrollments.length;

    // Remove enrollments array from response to reduce payload size
    const { enrollments, ...courseData } = course;

    return NextResponse.json({
      course: {
        ...courseData,
        studentCount,
        isEnrolled
      },
    });
  } catch (error) {
    console.error("GET /api/courses/[id] ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course details
export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'MENTOR') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const mentor = await prisma.mentor.findUnique({ where: { userId: user.id } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
    }

    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingCourse.mentorId !== mentor.id) {
      return NextResponse.json({ error: "Unauthorized to edit this course" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      level,
      durationWeeks,
      price,
      imageUrl,
      learningOutcomes,
    } = body;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        categoryId: Number(categoryId),
        level,
        durationWeeks: Number(durationWeeks),
        price: Number(price),
        image: imageUrl || existingCourse.image,
        learningOutcomes,
      },
    });

    return NextResponse.json({ course: updatedCourse });

  } catch (error) {
    console.error("PUT /api/courses/[id] ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
