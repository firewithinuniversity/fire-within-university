import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCourseBySlug, getAllCourseSlugs } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { courseJsonLd, breadcrumbJsonLd, canonicalUrl } from "@/lib/metadata";
import CourseProgressBar from "@/components/CourseProgressBar";
import BookmarkButton from "@/components/BookmarkButton";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  const imageUrl = course.coverImage
    ? imageUrlFor(course.coverImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;
  return {
    title: course.title,
    description: course.description,
    alternates: {
      canonical: canonicalUrl(`/courses/${slug}`),
    },
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      url: canonicalUrl(`/courses/${slug}`),
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const courseUrl = canonicalUrl(`/courses/${slug}`);

  return (
    <div className="bg-brown-deep min-h-screen">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            courseJsonLd({
              title: course.title,
              description: course.description,
              url: courseUrl,
              instructor: course.instructor,
            })
          ).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: canonicalUrl() },
              { name: "Courses", url: canonicalUrl("/courses") },
              { name: course.title, url: courseUrl },
            ])
          ).replace(/</g, "\\u003c"),
        }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 pt-8 text-sm text-cream/50 flex items-center gap-2" aria-label="Breadcrumb">
        <Link href="/courses" className="hover:text-gold transition-colors">
          Courses
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-cream/60">{course.title}</span>
      </nav>

      {/* Hero */}
      <section className="relative pt-6 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {course.coverImage && (
            <div className="relative aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={imageUrlFor(course.coverImage).width(1200).height(514).url()}
                alt={course.coverImage.alt || course.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-deep via-transparent to-transparent" />
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-4">
              {course.title}
            </h1>
            <BookmarkButton slug={slug} type="course" className="mt-2 flex-shrink-0" />
          </div>

          {course.instructor && (
            <p className="text-cream/60 text-sm mb-2">
              Taught by <span className="text-gold">{course.instructor}</span>
            </p>
          )}

          {course.description && (
            <p className="text-cream/70 text-lg leading-relaxed max-w-2xl mb-8">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-cream/50">
            <span>{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
          </div>

          {/* Progress bar — only visible to signed-in users */}
          <div className="mt-6 max-w-sm">
            <CourseProgressBar
              courseSlug={slug}
              totalLessons={course.lessons?.length ?? 0}
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* What You'll Learn */}
        {course.whatYoullLearn && course.whatYoullLearn.length > 0 && (
          <section className="bg-brown-card border border-white/[0.08] rounded-2xl p-8 mb-10">
            <h2 className="font-serif text-2xl font-bold text-cream mb-6">
              What You&apos;ll Learn
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.whatYoullLearn.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-cream/80 text-sm">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Lessons */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-cream mb-6">
            Lessons
          </h2>
          {course.lessons && course.lessons.length > 0 ? (
            <ol className="space-y-3">
              {course.lessons.map((lesson, i) => (
                <li key={lesson._id}>
                  <Link
                    href={`/courses/${slug}/lessons/${lesson.slug.current}`}
                    className="group flex items-center gap-4 bg-brown-card border border-white/[0.08] rounded-xl p-5 transition-all duration-200 hover:border-gold/30 hover:bg-[#553318]"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-brown-deep border border-cream/10 flex items-center justify-center text-gold font-bold text-sm">
                      {lesson.lessonNumber ?? i + 1}
                    </span>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-cream font-semibold group-hover:text-gold transition-colors truncate">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-cream/50 mt-1">
                        {lesson.scripture && <span>{lesson.scripture}</span>}
                        {lesson.duration && <span>{lesson.duration}</span>}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-cream/50 group-hover:text-gold transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="bg-brown-card border border-white/[0.08] rounded-2xl p-8 text-center">
              <p className="text-cream/50">Lessons coming soon.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
