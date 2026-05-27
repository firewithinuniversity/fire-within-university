import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonBySlug, getAllCoursesWithLessons } from "@/lib/sanity/queries";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import dynamic from "next/dynamic";
const PortableTextRenderer = dynamic(() => import("@/components/PortableTextRenderer"), {
  loading: () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-cream/[0.06] rounded w-full" />
      <div className="h-4 bg-cream/[0.06] rounded w-3/4" />
      <div className="h-4 bg-cream/[0.06] rounded w-5/6" />
    </div>
  ),
});
import LessonCompleteButton from "@/components/LessonCompleteButton";
import BookmarkButton from "@/components/BookmarkButton";
import { canonicalUrl } from "@/lib/metadata";

function sanitizeHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (["https:", "http:"].includes(parsed.protocol)) return url;
  } catch {}
  return "#";
}

type Props = { params: Promise<{ slug: string; lessonSlug: string }> };

export async function generateStaticParams() {
  const courses = await getAllCoursesWithLessons();
  return courses.flatMap((course) =>
    (course.lessons ?? []).map((lesson) => ({
      slug: course.slug,
      lessonSlug: lesson.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const data = await getLessonBySlug(slug, lessonSlug);
  if (!data?.currentLesson || !data?.course) return { title: "Lesson Not Found" };

  const title = `${data.currentLesson.title} — ${data.course.title}`;
  const description = data.currentLesson.scripture
    ? `${data.currentLesson.title} — ${data.currentLesson.scripture}. Part of the ${data.course.title} course at Fire Within University.`
    : `${data.currentLesson.title}. Part of the ${data.course.title} course at Fire Within University.`;
  const url = canonicalUrl(`/courses/${slug}/lessons/${lessonSlug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const data = await getLessonBySlug(slug, lessonSlug);
  if (!data?.currentLesson || !data?.course) notFound();

  const { course, currentLesson } = data;
  const lessons = course.lessons || [];
  const currentIndex = lessons.findIndex(
    (l) => l.slug.current === lessonSlug
  );
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="bg-brown-deep min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-cream/50 mb-8 flex-wrap">
          <Link href="/courses" className="hover:text-gold transition-colors">
            Courses
          </Link>
          <span>/</span>
          <Link
            href={`/courses/${course.slug.current}`}
            className="hover:text-gold transition-colors"
          >
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-cream/80">
            Lesson {currentLesson.lessonNumber ?? currentIndex + 1}
          </span>
        </nav>

        {/* Lesson header */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-2">
            {currentLesson.title}
          </h1>
          <BookmarkButton slug={lessonSlug} type="lesson" courseSlug={slug} className="mt-2 flex-shrink-0" />
        </div>

        <div className="flex items-center gap-4 text-sm text-cream/50 mb-8">
          {currentLesson.scripture && (
            <span className="text-gold">{currentLesson.scripture}</span>
          )}
          {currentLesson.duration && <span>{currentLesson.duration}</span>}
        </div>

        {/* Video */}
        {currentLesson.youtubeUrl && (
          <YouTubeEmbed
            url={currentLesson.youtubeUrl}
            title={currentLesson.title}
          />
        )}

        {/* Body */}
        {currentLesson.body && (
          <div className="mt-10">
            <PortableTextRenderer value={currentLesson.body as unknown[]} />
          </div>
        )}

        {/* Mark complete */}
        <div className="mt-10">
          <LessonCompleteButton lessonSlug={lessonSlug} courseSlug={slug} />
        </div>

        {/* Downloads */}
        {currentLesson.downloads && currentLesson.downloads.length > 0 && (
          <section className="mt-12 bg-brown-card border border-white/[0.08] rounded-2xl p-6">
            <h2 className="font-serif text-xl font-bold text-cream mb-4">
              Downloads
            </h2>
            <ul className="space-y-2">
              {currentLesson.downloads.map((dl, i) => (
                <li key={i}>
                  <a
                    href={sanitizeHref(dl.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-cream/80 hover:text-gold transition-colors text-sm py-2"
                  >
                    <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {dl.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Prev / Next navigation */}
        <nav className="mt-12 flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link
              href={`/courses/${slug}/lessons/${prevLesson.slug.current}`}
              className="flex items-center gap-2 text-cream/60 hover:text-gold transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden sm:inline">{prevLesson.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              href={`/courses/${slug}/lessons/${nextLesson.slug.current}`}
              className="flex items-center gap-2 text-cream/60 hover:text-gold transition-colors text-sm"
            >
              <span className="hidden sm:inline">{nextLesson.title}</span>
              <span className="sm:hidden">Next</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </div>
  );
}
