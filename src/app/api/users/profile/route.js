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

// DELETE User
export async function DELETE(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userEmail = decoded.email;

    // Use transaction to ensure complete cleanup
    await prisma.$transaction(async (tx) => {
      // 1. Find the user first to get IDs
      const user = await tx.user.findUnique({
        where: { email: userEmail },
        include: { mentor: true, student: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === 'MENTOR' && user.mentor) {
        // --- Mentor Deletion Logic ---
        // 1. Find all courses by this mentor
        const courses = await tx.course.findMany({
            where: { mentorId: user.mentor.id },
            select: { id: true }
        });
        const courseIds = courses.map(c => c.id);

        // 2. Delete all enrollments in these courses (from any student)
        if (courseIds.length > 0) {
            await tx.enrollment.deleteMany({
                where: { courseId: { in: courseIds } }
            });

            // 3. Delete the courses
            await tx.course.deleteMany({
                where: { id: { in: courseIds } }
            });
        }
        
        // 4. Delete Mentor profile
        await tx.mentor.delete({
            where: { id: user.mentor.id }
        });

      } else if (user.role === 'STUDENT' && user.student) {
        // --- Student Deletion Logic ---
        // 1. Delete all enrollments by this student
        await tx.enrollment.deleteMany({
            where: { studentId: user.student.id }
        });

        // 2. Delete Student profile
        await tx.student.delete({
            where: { id: user.student.id }
        });
      }

      // Finally, delete the User record
      await tx.user.delete({
        where: { id: user.id }
      });
    });

    // Determine environment to set cookie correctly
    const isProduction = process.env.NODE_ENV === 'production';

    // Create response and clear cookie
    const response = NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0), 
        secure: isProduction,
        path: "/",
        sameSite: "strict",
    });

    return response;

  } catch (error) {
    console.error("DELETE /api/users/profile ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
