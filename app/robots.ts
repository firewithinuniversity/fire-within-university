/**
 * app/robots.ts — robots.txt for search engine crawlers
 *
 * Next.js serves the return value as /robots.txt automatically.
 *
 * RULES:
 * - Allow all crawlers to index public pages
 * - Block /studio/ — the Sanity editor is private, not indexable content
 * - Block /api/ — API routes are not web pages; indexing them wastes crawl budget
 *
 * The sitemap pointer tells crawlers exactly where to find all your URLs,
 * which speeds up indexing of new posts.
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.firewithinuniversity.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
