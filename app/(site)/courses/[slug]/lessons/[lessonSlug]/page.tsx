import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonBySlug, getAllCourseSlugs, getCourseBySlug } from "@/lib/sanity/queries";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import YouTubeEmbed from "@/components/YouTubeEmbed";

function sanitizeHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (["https:", "http:"].includes(parsed.protocol)) return url;
  } catch {}
  return "#";
}

type Props = { params: Promise<{ slug: string; lessonSlug: string }> };

export async function generateStaticParams() {
  const courseSlugs = await getAllCourseSlugs();
  const params: { slug: string; lessonSlug: string }[] = [];
  for (const { slug } of courseSlugs) {
    const course = await getCourseBySlug(slug);
    if (course?.lessons) {
      for (const lesson of course.lessons) {
        params.push({ slug, lessonSlug: lesson.slug.current });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const data = await getLessonBySlug(slug, lessonSlug);
  return {
    title: data?.currentLesson
      ? `${data.currentLesson.title} | ${data.course?.title} | Fire Within University`
      : "Lesson Not Found",
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
    <div className="bg-[#1a0f05] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-24">
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
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-2">
          {currentLesson.title}
        </h1>

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
          <div className="prose prose-invert prose-cream max-w-none mt-10 [&_p]:text-cream/80 [&_h2]:text-cream [&_h3]:text-cream [&_a]:text-gold [&_a:hover]:text-gold-light [&_strong]:text-cream [&_blockquote]:border-gold/30 [&_blockquote]:text-cream/70">
            <PortableText value={currentLesson.body as PortableTextBlock[]} />
          </div>
        )}

        {/* Downloads */}
        {currentLesson.downloads && currentLesson.downloads.length > 0 && (
          <section className="mt-12 bg-[#4A2A12] border border-white/[0.08] rounded-2xl p-6">
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
