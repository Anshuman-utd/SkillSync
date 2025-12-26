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
      include: {
        mentor: true,
        student: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let chats = [];

    if (user.role === 'MENTOR' && user.mentor) {
        // Find chats where mentor is participant
        const rawChats = await prisma.chat.findMany({
            where: { mentorId: user.mentor.id },
            include: {
                student: { include: { user: true } },
                course: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        chats = rawChats.map(chat => ({
            chatId: chat.id,
            title: chat.student.user.name || "Student", 
            subtitle: chat.course.title,
            image: chat.student.user.image,
            courseId: chat.courseId,
            studentId: chat.studentId,
            lastMessage: chat.messages[0]?.content || "No messages yet",
            updatedAt: chat.messages[0]?.createdAt || chat.updatedAt
        }));

    } else if (user.role === 'STUDENT' && user.student) {
        // Find chats where student is participant
        const rawChats = await prisma.chat.findMany({
            where: { studentId: user.student.id },
            include: {
                mentor: { include: { user: true } },
                course: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        chats = rawChats.map(chat => ({
            chatId: chat.id,
            title: chat.mentor.user.name || "Mentor",
            subtitle: chat.course.title,
            image: chat.mentor.user.image,
            courseId: chat.courseId, // Keep for reference
            mentorId: chat.mentorId, // For profile matching
            lastMessage: chat.messages[0]?.content || "No messages yet",
            updatedAt: chat.messages[0]?.createdAt || chat.updatedAt
        }));
    }

    // Sort by updatedAt desc
    chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return NextResponse.json({ chats }, { status: 200 });

  } catch (error) {
    console.error("GET /api/chats ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { courseId } = await req.json();
    
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
      include: {
        student: true,
      },
    });

    if (!user || user.role !== 'STUDENT' || !user.student) {
        return NextResponse.json({ error: "Only students can start a chat" }, { status: 403 });
    }
    
    if (!courseId) {
        return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: user.student.id,
                courseId: parseInt(courseId)
            }
        },
        include: { course: true }
    });

    if (!enrollment) {
        return NextResponse.json({ error: "You must be enrolled in the course to chat" }, { status: 403 });
    }

    // Check if chat exists
    let chat = await prisma.chat.findUnique({
        where: {
            courseId_studentId: {
                courseId: parseInt(courseId),
                studentId: user.student.id
            }
        }
    });

    if (!chat) {
        // Create Chat
        chat = await prisma.chat.create({
            data: {
                courseId: parseInt(courseId),
                studentId: user.student.id,
                mentorId: enrollment.course.mentorId
            }
        });
    }

    return NextResponse.json({ chatId: chat.id }, { status: 200 });

  } catch (error) {
    console.error("POST /api/chats ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
