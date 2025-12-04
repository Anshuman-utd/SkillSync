import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id: userIdParam } = await params;
    const userId = Number(userIdParam);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentor: true,
        student: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let courses = [];
    let bio = "";

    if (user.role === "MENTOR" && user.mentor) {
        bio = user.mentor.bio;
        // Fetch published courses
        courses = await prisma.course.findMany({
            where: { 
                mentorId: user.mentor.id,
                status: 'PUBLISHED'
            },
            include: {
                enrollments: true // for count
            }
        });
        
        // Format courses
        courses = courses.map(c => ({
            id: c.id,
            title: c.title,
            image: c.image,
            rating: c.rating,
            studentCount: c.enrollments.length
        }));
    } else if (user.role === "STUDENT" && user.student) {
        bio = user.student.bio;
    }

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email, // Consider hiding email for privacy if needed
            image: user.image,
            role: user.role,
            createdAt: user.createdAt,
            bio
        },
        courses
    });

  } catch (error) {
    console.error("GET /api/users/[id]/public-profile ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
