import type { MetadataRoute } from "next";
import { getAllPostSlugs, getAllCourseSlugs, getAllSeries, getAllAuthors, getAllCoursesWithLessons } from "@/lib/sanity/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/series`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/ethos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/donate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/statement-of-faith`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [postSlugs, courseSlugs, allSeries, allAuthors, coursesWithLessons] = await Promise.all([
    getAllPostSlugs(),
    getAllCourseSlugs(),
    getAllSeries(),
    getAllAuthors(),
    getAllCoursesWithLessons(),
  ]);

  const postPages: MetadataRoute.Sitemap = postSlugs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post._updatedAt || post.publishedAt
      ? new Date(post._updatedAt ?? post.publishedAt!)
      : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const coursePages: MetadataRoute.Sitemap = courseSlugs.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course._updatedAt ? new Date(course._updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Include individual lesson pages (single query, no N+1)
  const lessonPages: MetadataRoute.Sitemap = coursesWithLessons.flatMap((course) =>
    (course.lessons ?? []).map((lesson) => ({
      url: `${baseUrl}/courses/${course.slug}/lessons/${lesson.slug}`,
      lastModified: lesson._updatedAt ? new Date(lesson._updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const seriesPages: MetadataRoute.Sitemap = allSeries.map((s) => ({
    url: `${baseUrl}/series/${s.slug.current}`,
    lastModified: s._updatedAt ? new Date(s._updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = allAuthors
    .filter((a): a is typeof a & { slug: { current: string } } => !!a.slug?.current)
    .map((a) => ({
      url: `${baseUrl}/authors/${a.slug.current}`,
      lastModified: a._updatedAt ? new Date(a._updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...postPages, ...coursePages, ...lessonPages, ...seriesPages, ...authorPages];
}
