import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // FETCH USER USING ID — NOT EMAIL
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        mentor: true,
      },
    });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    const { password, ...safeUser } = user;

    return NextResponse.json({ user: safeUser }, { status: 200 });

  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
