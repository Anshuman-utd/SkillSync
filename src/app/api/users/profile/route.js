import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET Profile
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: {
        student: {
            include: {
                Enrollment: {
                    include: {
                        course: true
                    }
                }
            }
        },
        mentor: {
            include: {
                Course: true
            }
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format response based on role
    let profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    };

    if (user.role === "MENTOR" && user.mentor) {
      profileData = {
        ...profileData,
        bio: user.mentor.bio,
        expertise: user.mentor.expertise,
        skills: user.mentor.skills,
        courses: user.mentor.Course,
        totalStudents: 0, // Calculate if needed, or fetch from stats API
        totalCourses: user.mentor.Course.length,
      };
      
      // Calculate total students for mentor
      const courseIds = user.mentor.Course.map(c => c.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        distinct: ['studentId']
      });
      profileData.totalStudents = enrollments.length;

    } else if (user.role === "STUDENT" && user.student) {
      profileData = {
        ...profileData,
        bio: user.student.bio,
        interests: user.student.interests,
        enrolledCourses: user.student.Enrollment.map(e => ({
            ...e.course,
            enrollmentDate: e.createdAt,
            progress: e.progress,
            completed: e.completed
        })),
      };
    }

    return NextResponse.json({ profile: profileData }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/profile ERROR:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// UPDATE Profile (Image, Bio, Skills, etc.)
export async function PUT(req) {
    try {
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
      }
  
      const decoded = verifyToken(token);
      const body = await req.json();
      const { image, bio, skills, expertise, interests } = body;
  
      const user = await prisma.user.update({
        where: { email: decoded.email },
        data: {
            image: image !== undefined ? image : undefined,
        },
        include: { mentor: true, student: true }
      });

      if (user.role === "MENTOR" && user.mentor) {
          await prisma.mentor.update({
              where: { id: user.mentor.id },
              data: {
                  bio: bio !== undefined ? bio : undefined,
                  skills: skills !== undefined ? skills : undefined,
                  expertise: expertise !== undefined ? expertise : undefined,
              }
          });
      } else if (user.role === "STUDENT" && user.student) {
          await prisma.student.update({
              where: { id: user.student.id },
              data: {
                  bio: bio !== undefined ? bio : undefined,
                  interests: interests !== undefined ? interests : undefined,
              }
          });
      }
  
      return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
    } catch (error) {
      console.error("PUT /api/users/profile ERROR:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
  }
