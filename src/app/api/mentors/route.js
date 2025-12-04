import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const mentors = await prisma.mentor.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        Course: {
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    // Get all mentor IDs
    const mentorIds = mentors.map(m => m.id);

    // Fetch all enrollments for these mentors to calculate unique students
    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          mentorId: { in: mentorIds }
        }
      },
      select: {
        studentId: true,
        course: {
          select: {
            mentorId: true
          }
        }
      }
    });

    const formattedMentors = mentors.map((mentor) => {
      // Filter enrollments for this mentor
      const mentorEnrollments = allEnrollments.filter(e => e.course.mentorId === mentor.id);
      // Count unique students
      const uniqueStudents = new Set(mentorEnrollments.map(e => e.studentId)).size;
      
      // Calculate average rating if available, otherwise dummy
      // Calculate average rating if available, otherwise dummy
      const avgRating = "0.0";

      return {
        id: mentor.id,
        userId: mentor.userId,
        name: mentor.user.name || "Unknown Mentor",
        image: mentor.user.image,
        bio: mentor.bio,
        expertise: mentor.expertise,
        skills: mentor.skills ? mentor.skills.split(",") : [],
        totalStudents: uniqueStudents,
        avgRating,
        courseCount: mentor.Course.length,
      };
    });

    return NextResponse.json({ mentors: formattedMentors });
  } catch (error) {
    console.error("Failed to fetch mentors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
