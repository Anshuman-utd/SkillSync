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
      include: { student: true },
    });

    if (!user || !user.student) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const studentId = user.student.id;

    // 1. Enrolled Courses
    const enrolledCount = await prisma.enrollment.count({
      where: {
        studentId: studentId,
      },
    });

    // 2. Certificates Earned (Completed courses)
    const certificatesEarned = await prisma.enrollment.count({
      where: {
        studentId: studentId,
        completed: true,
      },
    });

    // 3. Learning Hours (Sum of duration of enrolled courses * 2 hours/week)
    // This is an estimation based on course duration.
    const allEnrolledCourses = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        course: true,
      },
    });
    
    const learningHours = allEnrolledCourses.reduce((acc, curr) => {
        // Assume 3 hours per week of course duration
        const hours = (curr.course.durationWeeks || 0) * 3;
        // Scale by progress (e.g. if 50% done, count 50% of total hours)
        const progressFraction = (curr.progress || 0) / 100;
        return acc + Math.round(hours * progressFraction);
    }, 0);

    // 4. Progress (Average progress across all enrollments)
    const totalProgress = allEnrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const progress = allEnrolledCourses.length > 0 ? Math.round(totalProgress / allEnrolledCourses.length) : 0;

    return NextResponse.json({
      stats: {
        enrolledCount,
        certificatesEarned,
        learningHours,
        progress,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/stats/student ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
