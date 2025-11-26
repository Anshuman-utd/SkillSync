import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    } // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    } // Get user data
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { student: true, mentor: true }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    } // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
