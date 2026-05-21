import Link from "next/link";
import Image from "next/image";
import { getAllCourses, type CourseSummary } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";

export const metadata = {
  title: "Courses | Fire Within University",
  description:
    "Explore our Bible courses and teaching series. Grow in the knowledge of Jesus Christ through structured study.",
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
    <div className="bg-[#1a0f05] min-h-screen">
      {/* Header */}
      <section className="pt-20 pb-12 text-center px-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-cream mb-4">
          Courses
        </h1>
        <p className="text-cream/70 max-w-xl mx-auto text-lg">
          Structured Bible study to deepen your walk with Christ. Each course
          includes video lessons, Scripture readings, and downloadable resources.
        </p>
      </section>

      {/* Course grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link
              key={course._id}
              href={`/courses/${course.slug.current}`}
              className="group bg-[#4A2A12] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_28px_-4px_rgba(61,31,10,0.3)] hover:-translate-y-1"
            >
              <div className="relative aspect-[16/9] bg-[#3D1F0A]">
                {course.coverImage ? (
                  <Image
                    src={imageUrlFor(course.coverImage).width(600).height(340).url()}
                    alt={course.coverImage.alt || course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gold/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
                {course.featured && (
                  <span className="absolute top-3 left-3 bg-gold text-brown text-xs font-bold px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-6">
                <h2 className="font-serif text-xl font-bold text-cream mb-2 group-hover:text-gold transition-colors">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-cream/60 text-sm leading-relaxed mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-cream/50">
                  {course.instructor && <span>{course.instructor}</span>}
                  <span>{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
