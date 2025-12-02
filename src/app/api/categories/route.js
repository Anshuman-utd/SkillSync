import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

/* --------------------------------------------------
   GET: Fetch all categories
-------------------------------------------------- */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("GET /categories Error:", error);
    return NextResponse.json(
      { categories: [] },
      { status: 200 }
    );
  }
}

/* --------------------------------------------------
   POST: Create a new category (optional)
   Only mentors or admins should be allowed
-------------------------------------------------- */
export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { mentor: true },
    });

    if (!user || !user.mentor) {
      return NextResponse.json(
        { error: "Only mentors can create categories" },
        { status: 403 }
      );
    }

    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // prevent duplicates
    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json({ category }, { status: 201 });

  } catch (error) {
    console.error("POST /categories Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
