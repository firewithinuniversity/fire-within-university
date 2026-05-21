import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/sanity/queries";
import { getAllCourseSlugs } from "@/lib/sanity/queries";
import { getAllSeries } from "@/lib/sanity/queries";
import { getAllAuthors } from "@/lib/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/series`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/ethos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const [postSlugs, courseSlugs, allSeries, allAuthors] = await Promise.all([
    getAllPostSlugs(),
    getAllCourseSlugs(),
    getAllSeries(),
    getAllAuthors(),
  ]);

  const postPages: MetadataRoute.Sitemap = postSlugs.map(({ slug }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const coursePages: MetadataRoute.Sitemap = courseSlugs.map(({ slug }) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const seriesPages: MetadataRoute.Sitemap = allSeries.map((s) => ({
    url: `${baseUrl}/series/${s.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = allAuthors
    .filter((a): a is typeof a & { slug: { current: string } } => !!a.slug?.current)
    .map((a) => ({
      url: `${baseUrl}/authors/${a.slug.current}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...postPages, ...coursePages, ...seriesPages, ...authorPages];
}
