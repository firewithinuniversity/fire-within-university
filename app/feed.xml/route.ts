import { getFilteredPosts } from "@/lib/sanity/queries";
import { canonicalUrl } from "@/lib/metadata";

/**
 * RSS 2.0 feed for blog posts.
 * Available at /feed.xml — auto-discovered via <link> in layout.
 */

const SITE_TITLE = "Fire Within University";
const SITE_DESCRIPTION =
  "Biblical teaching, sermons, and devotionals to strengthen your faith and deepen your walk with Jesus.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await getFilteredPosts({ page: 1, limit: 50 });

  const feedUrl = canonicalUrl("/feed.xml");
  const blogUrl = canonicalUrl("/blog");

  const items = posts
    .map((post) => {
      const postUrl = canonicalUrl(`/blog/${post.slug.current}`);
      const pubDate = new Date(post.publishedAt).toUTCString();
      const category = post.category?.title
        ? `<category>${escapeXml(post.category.title)}</category>`
        : "";

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt ?? "")}</description>
      <author>noreply@firewithinuniversity.com (${escapeXml(post.author?.name ?? SITE_TITLE)})</author>
      ${category}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
