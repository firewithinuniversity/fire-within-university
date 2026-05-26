import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import { getAllCourses, type CourseSummary } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import { canonicalUrl } from "@/lib/metadata";

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

const PLACEHOLDER_COURSES: CourseSummary[] = [
  {
    _id: "placeholder-1",
    title: "Knowing Jesus",
    slug: { current: "knowing-jesus" },
    description:
      "A foundational course exploring who Jesus is through Scripture, His teachings, and His mission for your life.",
    instructor: "Fire Within Team",
    lessonCount: 8,
    featured: true,
  },
  {
    _id: "placeholder-2",
    title: "Foundations of Faith",
    slug: { current: "foundations-of-faith" },
    description:
      "Build a strong biblical foundation covering the core doctrines every believer should understand.",
    instructor: "Fire Within Team",
    lessonCount: 6,
    featured: false,
  },
];

export default async function CoursesPage() {
  const sanityCourses = await getAllCourses();
  const courses = sanityCourses.length > 0 ? sanityCourses : PLACEHOLDER_COURSES;

  return (
    <div className="bg-brown-deep min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 text-center px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brown-card/20 to-transparent" />
        <div className="relative">
          <p className="text-gold/70 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Learn at Your Own Pace</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-cream mb-6 tracking-[-0.02em] leading-[0.95]">
            Courses
          </h1>
          <p className="text-cream/55 max-w-lg mx-auto text-lg leading-[1.7]">
            Structured Bible study to deepen your walk with Christ. Each course
            includes video lessons, Scripture readings, and downloadable resources.
          </p>
        </div>
      </section>

      {/* Course grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${courses.length >= 3 ? "lg:grid-cols-3" : "max-w-4xl mx-auto"}`}>
          {courses.map((course, i) => (
            <SectionReveal key={course._id} delay={i * 100} distance={20}>
              <Link
                href={`/courses/${course.slug.current}`}
                className="group block bg-brown-card/70 border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/15 hover:shadow-card-hover hover:-translate-y-1"
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-14 h-14 text-gold/15 transition-colors duration-300 group-hover:text-gold/25" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
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
                    <p className="text-cream/45 text-[13px] leading-relaxed mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-cream/35 uppercase tracking-wider font-medium">
                    {course.instructor && <span>{course.instructor}</span>}
                    <span>{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
