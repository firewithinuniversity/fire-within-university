import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalCompletions,
    courseSlugs,
    recentCompletions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lessonProgress.count(),
    prisma.lessonProgress.groupBy({
      by: ["courseSlug"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.lessonProgress.findMany({
      orderBy: { completedAt: "desc" },
      take: 50,
      select: {
        courseSlug: true,
        lessonSlug: true,
        completedAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const enrolledUsers = await prisma.lessonProgress.groupBy({
    by: ["userId"],
  });

  const courseStats = courseSlugs.map((c) => ({
    courseSlug: c.courseSlug,
    completions: c._count.id,
  }));

  return NextResponse.json({
    totalUsers,
    activeStudents: enrolledUsers.length,
    totalCompletions,
    courseStats,
    recentCompletions,
  });
}
