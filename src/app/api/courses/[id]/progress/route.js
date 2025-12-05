import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req, { params }) {
  try {
    const { id: courseIdParam } = await params;
    const courseId = Number(courseIdParam);

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

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

    if (!user || user.role !== "STUDENT" || !user.student) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { progress } = body;

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: "Invalid progress value. Must be between 0 and 100." },
        { status: 400 }
      );
    }

    // Find the enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.student.id,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 404 }
      );
    }

    // Update progress and completion status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: progress,
        completed: progress === 100,
      },
    });

    return NextResponse.json({
      message: "Progress updated",
      progress: updatedEnrollment.progress,
      completed: updatedEnrollment.completed,
    });

  } catch (error) {
    console.error("PUT /api/courses/[id]/progress ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
