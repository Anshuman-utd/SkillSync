import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mentor: {
          include: { user: true }
        },
        category: true,
      },
    });

    const formatted = (courses || []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      rating: c.rating ?? 0,
      duration: c.durationWeeks + " weeks",
      level: c.level,
      category: c.category?.name || "Uncategorized",
      categoryId: c.categoryId || null,
      mentor: {
        name: c.mentor?.user?.name || "Unknown Mentor",
        email: c.mentor?.user?.email || null
      }
    }));

    return NextResponse.json({ courses: formatted }, { status: 200 });

  } catch (error) {
    console.error("COURSES API ERROR:", error);
    return NextResponse.json({ courses: [] }, { status: 200 });
  }
}
