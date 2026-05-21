import type { MetadataRoute } from "next";
import { getAllPostSlugs, getAllCourseSlugs, getAllSeries, getAllAuthors, getAllCourses, getCourseBySlug } from "@/lib/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/courses`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/series`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resources`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/ethos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/donate`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [postSlugs, courseSlugs, allSeries, allAuthors] = await Promise.all([
    getAllPostSlugs(),
    getAllCourseSlugs(),
    getAllSeries(),
    getAllAuthors(),
  ]);

  const postPages: MetadataRoute.Sitemap = postSlugs.map(({ slug }) => ({
    url: `${baseUrl}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const coursePages: MetadataRoute.Sitemap = courseSlugs.map(({ slug }) => ({
    url: `${baseUrl}/courses/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Include individual lesson pages
  const lessonPages: MetadataRoute.Sitemap = [];
  for (const { slug } of courseSlugs) {
    const course = await getCourseBySlug(slug);
    if (course?.lessons) {
      for (const lesson of course.lessons) {
        lessonPages.push({
          url: `${baseUrl}/courses/${slug}/lessons/${lesson.slug.current}`,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        });
      }
    }
  }

  const seriesPages: MetadataRoute.Sitemap = allSeries.map((s) => ({
    url: `${baseUrl}/series/${s.slug.current}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = allAuthors
    .filter((a): a is typeof a & { slug: { current: string } } => !!a.slug?.current)
    .map((a) => ({
      url: `${baseUrl}/authors/${a.slug.current}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...postPages, ...coursePages, ...lessonPages, ...seriesPages, ...authorPages];
}
