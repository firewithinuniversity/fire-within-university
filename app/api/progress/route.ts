import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get("courseSlug");

  const where: { userId: string; courseSlug?: string } = { userId: session.user.id };
  if (courseSlug) where.courseSlug = courseSlug;

  const progress = await prisma.lessonProgress.findMany({
    where,
    select: { lessonSlug: true, courseSlug: true, completedAt: true },
    orderBy: { completedAt: "asc" },
  });

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const ip = getIpFromRequest(request);
  if (!checkRateLimit(ip, { maxRequests: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  let body: { lessonSlug?: string; courseSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const { lessonSlug, courseSlug } = body;
  if (!lessonSlug || !courseSlug) {
    return NextResponse.json({ message: "lessonSlug and courseSlug are required." }, { status: 400 });
  }

  const entry = await prisma.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId: session.user.id, lessonSlug } },
    update: {},
    create: { userId: session.user.id, lessonSlug, courseSlug },
  });

  return NextResponse.json({ progress: entry }, { status: 200 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonSlug = searchParams.get("lessonSlug");
  if (!lessonSlug) {
    return NextResponse.json({ message: "lessonSlug is required." }, { status: 400 });
  }

  await prisma.lessonProgress.deleteMany({
    where: { userId: session.user.id, lessonSlug },
  });

  return NextResponse.json({ message: "Progress removed." });
}
