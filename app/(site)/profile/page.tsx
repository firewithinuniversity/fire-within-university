import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllCourses } from "@/lib/sanity/queries";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  // Fetch user data and progress in parallel
  const [user, progress, courses, bookmarks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, emailVerified: true, createdAt: true, image: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonSlug: true, courseSlug: true, completedAt: true },
      orderBy: { completedAt: "desc" },
    }),
    getAllCourses(),
    prisma.bookmark.findMany({
      where: { userId: session.user.id },
      select: { slug: true, type: true, courseSlug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/");

  // Group progress by course
  const progressByCourse = new Map<string, { lessonSlug: string; completedAt: Date }[]>();
  for (const p of progress) {
    const existing = progressByCourse.get(p.courseSlug) ?? [];
    existing.push({ lessonSlug: p.lessonSlug, completedAt: p.completedAt });
    progressByCourse.set(p.courseSlug, existing);
  }

  // Build course progress data
  const courseProgress = courses
    .filter((c) => progressByCourse.has(c.slug.current))
    .map((c) => ({
      title: c.title,
      slug: c.slug.current,
      totalLessons: c.lessonCount,
      completedLessons: progressByCourse.get(c.slug.current)?.length ?? 0,
      description: c.description,
    }));

  // Recent completions (last 10)
  const recentCompletions = progress.slice(0, 10).map((p) => {
    const course = courses.find((c) => c.slug.current === p.courseSlug);
    return {
      lessonSlug: p.lessonSlug,
      courseSlug: p.courseSlug,
      courseTitle: course?.title ?? p.courseSlug,
      completedAt: p.completedAt.toISOString(),
    };
  });

  // Build saved items with display titles
  const savedItems = bookmarks.map((b) => {
    const course = courses.find((c) => c.slug.current === (b.type === "course" ? b.slug : b.courseSlug));
    return {
      slug: b.slug,
      type: b.type as "course" | "lesson",
      courseSlug: b.courseSlug,
      title: b.type === "course"
        ? (course?.title ?? b.slug)
        : b.slug.replace(/-/g, " "),
      courseTitle: course?.title ?? b.courseSlug ?? "",
      savedAt: b.createdAt.toISOString(),
    };
  });

  return (
    <div className="bg-brown-deep min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-cream/50 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-cream/80">My Profile</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-10">
          My Profile
        </h1>

        <ProfileClient
          initialName={user.name ?? ""}
          email={user.email ?? ""}
          emailVerified={!!user.emailVerified}
          memberSince={user.createdAt.toISOString()}
          image={user.image}
          courseProgress={courseProgress}
          recentCompletions={recentCompletions}
          totalCompleted={progress.length}
          savedItems={savedItems}
        />
      </div>
    </div>
  );
}
