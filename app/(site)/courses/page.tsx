import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import PageHeader from "@/components/PageHeader";
import CourseProgressMini from "@/components/CourseProgressMini";
import EmailSignup from "@/components/EmailSignup";
import { getAllCourses, type CourseSummary } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { canonicalUrl } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore our Bible courses and teaching series. Grow in the knowledge of Jesus Christ through structured study.",
  alternates: {
    canonical: canonicalUrl("/courses"),
  },
  openGraph: {
    title: "Courses",
    description: "Explore our Bible courses and teaching series. Grow in the knowledge of Jesus Christ through structured study.",
    url: canonicalUrl("/courses"),
  },
};

// Shown when Sanity returns no published courses yet. Song of Solomon is our
// launch course; new lessons are released one at a time.
const PLACEHOLDER_COURSES: CourseSummary[] = [
  {
    _id: "placeholder-song-of-solomon",
    title: "Song of Solomon",
    slug: { current: "song-of-solomon" },
    description:
      "A verse-by-verse walk through Song of Solomon. New lessons release one at a time — subscribe to be notified when the next drops.",
    instructor: "Brett & Jude",
    lessonCount: 0,
    featured: true,
  },
];

export default async function CoursesPage() {
  const sanityCourses = await getAllCourses();
  const courses = sanityCourses.length > 0 ? sanityCourses : PLACEHOLDER_COURSES;

  return (
    <div className="bg-brown-deep min-h-screen">
      <PageHeader
        eyebrow="Learn at Your Own Pace"
        title="Courses"
        subtitle="Structured Bible study to deepen your walk with Christ. Each course includes video lessons, Scripture readings, and downloadable resources."
      />

      {/* Empty state */}
      {sanityCourses.length === 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="max-w-lg mx-auto text-center py-14 space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/[0.08] text-gold mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-cream">
              Courses Coming Soon
            </h2>
            <p className="text-cream/70 leading-relaxed">
              We&apos;re building out our course library. Drop your email below to be the first to know when new courses launch.
            </p>
            <p className="text-cream/50 text-sm italic">
              &ldquo;Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.&rdquo; — 2 Timothy 2:15
            </p>
            <div className="pt-2">
              <EmailSignup variant="inline" location="courses" />
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold text-sm transition-colors"
            >
              Browse sermons while you wait
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      )}

      {/* Course grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${courses.length >= 3 ? "lg:grid-cols-3" : "max-w-4xl mx-auto"}`}>
          {courses.map((course, i) => (
            <SectionReveal key={course._id} delay={i * 100} distance={20}>
              <Link
                href={`/courses/${course.slug.current}`}
                className="group block bg-brown-card/70 border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/15 hover:shadow-kindle hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] bg-brown overflow-hidden">
                  {course.coverImage ? (
                    <Image
                      src={imageUrlFor(course.coverImage).width(600).height(340).url()}
                      alt={course.coverImage.alt || course.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brown-card via-brown to-[#2a1508] flex items-center justify-center overflow-hidden">
                      {/* warm glow */}
                      <div aria-hidden="true" className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gold/[0.10] blur-3xl transition-all duration-500 group-hover:bg-gold/[0.16]" />
                      {/* dotted texture */}
                      <div aria-hidden="true" className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,160,32,0.5) 1px, transparent 0)", backgroundSize: "22px 22px" }} />
                      <svg className="relative w-12 h-12 text-gold/40 transition-all duration-300 group-hover:text-gold/60 group-hover:scale-110" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  )}
                  {course.featured && (
                    <span className="absolute top-3 left-3 bg-gold/90 text-brown text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      Featured
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brown/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <h2 className="font-serif text-xl font-bold text-cream mb-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-cream/70 text-[13px] leading-relaxed mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-cream/60 uppercase tracking-wider font-medium">
                    {course.instructor && <span>{course.instructor}</span>}
                    <span className={course.lessonCount === 0 ? "text-gold/70" : undefined}>
                      {course.lessonCount === 0
                        ? "Coming soon"
                        : `${course.lessonCount} lesson${course.lessonCount !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <CourseProgressMini courseSlug={course.slug.current} totalLessons={course.lessonCount} />
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
