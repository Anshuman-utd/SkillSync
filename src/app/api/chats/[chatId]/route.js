import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req, { params }) {
  try {
    const { chatId } = await params;
    
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

    const chatIdInt = parseInt(chatId);

    // Fetch Chat
    const chat = await prisma.chat.findUnique({
        where: { id: chatIdInt },
        include: {
            student: true,
            mentor: true,
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            role: true,
                        }
                    }
                }
            }
        }
    });

    if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Authorization
    let isParticipating = false;
    if (user.role === 'MENTOR' && user.mentor && chat.mentorId === user.mentor.id) {
        isParticipating = true;
    } else if (user.role === 'STUDENT' && user.student && chat.studentId === user.student.id) {
        isParticipating = true;
    }

    if (!isParticipating) {
         return NextResponse.json({ error: "Unauthorized access to this chat" }, { status: 403 });
    }

    // Format messages
    const messages = chat.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderRole: msg.sender.role,
        senderImage: msg.sender.image,
        createdAt: msg.createdAt,
    }));

    return NextResponse.json({ messages }, { status: 200 });

  } catch (error) {
    console.error("GET /api/chats/[chatId] ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
