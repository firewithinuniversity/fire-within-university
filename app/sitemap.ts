/**
 * app/sitemap.ts — XML sitemap for search engines
 *
 * Next.js App Router treats this as a "metadata route" — it automatically
 * serves the return value as /sitemap.xml with the correct Content-Type.
 *
 * WHY sitemaps matter:
 * Google and other crawlers discover pages via sitemaps. Without one,
 * the crawler has to follow links from your homepage to find every article.
 * With one, every new post is indexed much faster.
 *
 * PRIORITY values (0.0 – 1.0):
 * - 1.0 = homepage (most important)
 * - 0.9 = blog index (changes most often)
 * - 0.8 = individual posts (main content)
 * - 0.7 = about, donate (important but rarely changes)
 * - 0.5 = contact (utility page)
 *
 * changeFrequency tells crawlers how often to revisit.
 */
import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── Dynamic post pages ───────────────────────────────────────────────────────
  const slugs = await getAllPostSlugs();
  const postPages: MetadataRoute.Sitemap = slugs.map(({ slug }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
