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

    if (!user || user.role !== "STUDENT" || !user.student) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.student.id,
      },
      include: {
        course: {
            include: {
                mentor: {
                    include: {
                        user: true
                    }
                },
                category: true,
                _count: {
                    select: { enrollments: true }
                }
            }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const enrolled = enrollments.map(e => ({
        id: e.id,
        courseId: e.courseId,
        progress: e.progress,
        completed: e.completed,
        course: {
            id: e.course.id,
            title: e.course.title,
            image: e.course.image,
            level: e.course.level,
            category: e.course.category,
            studentCount: e.course._count.enrollments,
            mentorId: e.course.mentorId,
            mentor: {
                user: {
                    name: e.course.mentor.user.name
                }
            }
        }
    }));

    return NextResponse.json({ enrolled }, { status: 200 });

  } catch (error) {
    console.error("GET /api/enrollments ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load enrollments" },
      { status: 500 }
    );
  }
}
