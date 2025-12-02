import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
        category: true,
      },
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      rating: c.rating,
      duration: (c.durationWeeks || 0) + " weeks",
      level: c.level,

      // SAFE ACCESS (no crash)
      category: c.category?.name || "Uncategorized",
      mentor: c.mentor?.user?.name || "Unknown Mentor",
    }));

    return NextResponse.json({ courses: formatted }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching courses:", error);

    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
