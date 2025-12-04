import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req, { params }) {
  try {
    const { id: courseIdParam } = await params;
    const courseId = Number(courseIdParam);
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { student: true },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can enroll in courses" },
        { status: 403 }
      );
    }

    // Self-healing: Create student record if missing
    let studentId = user.student?.id;
    if (!studentId) {
        const newStudent = await prisma.student.create({
            data: { userId: user.id }
        });
        studentId = newStudent.id;
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId,
          courseId: Number(courseId),
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studentId,
        courseId: Number(courseId),
      },
    });

    return NextResponse.json(
      { message: "Enrolled successfully", enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/courses/[id]/enroll ERROR:", error);
    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}
