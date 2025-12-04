import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req, { params }) {
  try {
    const { id: courseIdParam } = await params;
    const courseId = Number(courseIdParam);
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { mentor: true },
    });

    if (!user || user.role !== "MENTOR" || !user.mentor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.mentorId !== user.mentor.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: Number(courseId) },
      data: { isFeatured: !course.isFeatured },
    });

    return NextResponse.json({ 
      message: "Course updated", 
      isFeatured: updatedCourse.isFeatured 
    }, { status: 200 });

  } catch (error) {
    console.error("PUT /api/courses/[id]/feature ERROR:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}
