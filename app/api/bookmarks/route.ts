import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIpFromRequest } from "@/lib/rateLimit";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/;
const VALID_TYPES = ["course", "lesson"] as const;

/** GET /api/bookmarks — list current user's bookmarks */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const ip = getIpFromRequest(request);
  if (!checkRateLimit(`bookmarks-read:${ip}`, { maxRequests: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where: { userId: string; type?: string } = { userId: session.user.id };
  if (type && VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    where.type = type;
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where,
      select: { slug: true, type: true, courseSlug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (err) {
    console.error("[Bookmarks GET] Database error:", err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

/** POST /api/bookmarks — add a bookmark */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const ip = getIpFromRequest(request);
  if (!checkRateLimit(`bookmarks-write:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  let body: { slug?: string; type?: string; courseSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const { slug, type, courseSlug } = body;

  if (!slug || !type) {
    return NextResponse.json({ message: "slug and type are required." }, { status: 400 });
  }

  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return NextResponse.json({ message: "Invalid slug format." }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ message: "type must be 'course' or 'lesson'." }, { status: 400 });
  }

  if (type === "lesson" && (!courseSlug || typeof courseSlug !== "string" || !SLUG_RE.test(courseSlug))) {
    return NextResponse.json({ message: "courseSlug is required for lesson bookmarks." }, { status: 400 });
  }

  try {
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_slug_type: {
          userId: session.user.id,
          slug,
          type,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        slug,
        type,
        courseSlug: type === "lesson" ? courseSlug : null,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (err) {
    console.error("[Bookmarks POST] Database error:", err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

/** DELETE /api/bookmarks?slug=xxx&type=course — remove a bookmark */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const ip = getIpFromRequest(request);
  if (!checkRateLimit(`bookmarks-del:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 })) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const type = searchParams.get("type");

  if (!slug || !type) {
    return NextResponse.json({ message: "slug and type are required." }, { status: 400 });
  }

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ message: "Invalid slug format." }, { status: 400 });
  }

  try {
    await prisma.bookmark.deleteMany({
      where: { userId: session.user.id, slug, type },
    });

    return NextResponse.json({ message: "Bookmark removed." });
  } catch (err) {
    console.error("[Bookmarks DELETE] Database error:", err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
