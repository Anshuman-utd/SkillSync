import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const mentorId = parseInt(id);

    // Find mentor by ID
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
        Course: {
          where: { status: "PUBLISHED" }, // Only show published courses
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Calculate unique students
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
    
    const avgRating = "0.0";

    const profile = {
      id: mentor.id,
      name: mentor.user.name,
      image: mentor.user.image,
      bio: mentor.bio,
      expertise: mentor.expertise,
      skills: mentor.skills,
      totalStudents,
      totalCourses: mentor.Course.length,
      avgRating,
      totalReviews: 0,
      courses: mentor.Course.map(c => ({
        id: c.id,
        title: c.title,
        image: c.image,
        level: c.level,
        rating: c.rating,
        durationWeeks: c.durationWeeks,
        studentCount: c._count.enrollments
      }))
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to fetch public profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
