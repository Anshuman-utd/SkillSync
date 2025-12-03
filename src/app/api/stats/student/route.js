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

    // 3. Learning Hours (Sum of duration of completed/enrolled courses - simplified logic)
    // For now, let's sum duration of all enrolled courses as "planned" hours, or just Mock if we don't track actual hours spent.
    // Better: Sum duration of completed courses.
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
        completed: true,
      },
      include: {
        course: true,
      },
    });
    const learningHours = completedEnrollments.reduce((acc, curr) => acc + (curr.course.durationWeeks * 2), 0); // Assuming 2 hours/week

    // 4. Progress (Average progress across all enrollments)
    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
      },
    });
    
    const totalProgress = allEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const progress = allEnrollments.length > 0 ? Math.round(totalProgress / allEnrollments.length) : 0;

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
