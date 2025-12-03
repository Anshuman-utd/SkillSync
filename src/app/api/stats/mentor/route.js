import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
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
      include: { mentor: true },
    });

    if (!user || !user.mentor) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const mentorId = user.mentor.id;

    // 1. Total Students (Unique students enrolled in mentor's courses)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          mentorId: mentorId,
        },
      },
      select: {
        studentId: true,
      },
      distinct: ["studentId"],
    });
    const totalStudents = enrollments.length;

    // 2. Active Courses
    const activeCourses = await prisma.course.count({
      where: {
        mentorId: mentorId,
      },
    });

    // 3. Average Rating
    const courses = await prisma.course.findMany({
      where: {
        mentorId: mentorId,
      },
      select: {
        rating: true,
        views: true,
      },
    });

    const totalRating = courses.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avgRating = courses.length > 0 ? (totalRating / courses.length).toFixed(1) : "0.0";

    // 4. Total Views (Growth proxy)
    const totalViews = courses.reduce((acc, curr) => acc + (curr.views || 0), 0);

    return NextResponse.json({
      stats: {
        totalStudents,
        activeCourses,
        avgRating,
        totalViews,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/stats/mentor ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
