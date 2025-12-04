import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET ALL COURSES
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100"); // Default high limit if not specified
    const skip = (page - 1) * limit;

    const where = {};
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (category && category !== "All Categories") {
      where.category = { name: category };
    }
    if (level && level !== "All Levels") {
      where.level = level.toUpperCase();
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          mentor: {
            include: { user: true },
          },
          category: true,
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      duration: `${c.durationWeeks} weeks`,
      rating: 0.0,
      level: c.level,
      category: c.category.name,
      categoryId: c.categoryId,
      mentor: c.mentor.user.name,
      mentorEmail: c.mentor.user.email,
      mentorImage: c.mentor.user.image, // Include mentor image
      studentCount: c._count.enrollments, // Dynamic student count
      price: c.price,
      status: c.status,
      learningOutcomes: c.learningOutcomes,
      isFeatured: c.isFeatured,
    }));

    return NextResponse.json({ 
      courses: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.log("GET /api/courses ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

// CREATE A COURSE
export async function POST(req) {
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
      include: { mentor: true },
    });

    if (!user || !user.mentor) {
      return NextResponse.json(
        { error: "Only mentors can create courses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      imageUrl,
      level,
      durationWeeks,
      categoryId,
      price,
      learningOutcomes,
    } = body;

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image: imageUrl || "",
        level,
        durationWeeks,
        categoryId: Number(categoryId),
        mentorId: user.mentor.id,
        price: Number(price) || 0,
        learningOutcomes: learningOutcomes || "",
        status: "PUBLISHED", // Auto-publish
      },
    });

    return NextResponse.json(
      { message: "Course created successfully", course },
      { status: 201 }
    );
  } catch (error) {
    console.log("POST /api/courses ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
